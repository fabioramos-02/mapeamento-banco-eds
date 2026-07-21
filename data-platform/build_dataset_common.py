"""Funções puras de montagem de dataset, compartilhadas entre build_dataset.py (EDS)
e build_dataset_controlador.py — cada um injeta sua própria função de domínio,
anotações e lista de tabelas-token, específicas do banco.
"""
from datetime import date

from der import diagram

SUGESTAO_TO_DECISAO = {
    "nao-migrar": "descartar", "tecnica": "recriar", "avaliar": "avaliar", "migrar": "migrar",
}


def sugestao(t, dom, anotacoes, tabelas_token, dominio_infra_id=None):
    """(classe, rotulo) — proposta inicial; decisão final é da gestão."""
    if t["count"] == 0:
        return "nao-migrar", "Sem uso — não migrar"
    if dominio_infra_id and dom.id == dominio_infra_id:
        return "tecnica", "Infra do sistema — recriar"
    if t["table"] in tabelas_token:
        return "tecnica", "Credenciais — recriar"
    nota = anotacoes.get(t["table"], "")
    if "?" in nota or "ntender" in nota:
        return "avaliar", "Avaliar"
    return "migrar", "Migrar"


def montar_tabela(t, dominio_fn, nome_negocio_fn, calcular_risco_fn, anotacoes, mapeadas,
                   tabelas_token=frozenset(), dominio_infra_id=None):
    dom = dominio_fn(t["table"])
    sug_cls, sug_rot = sugestao(t, dom, anotacoes, tabelas_token, dominio_infra_id)
    return {
        "schema": t["schema"], "table": t["table"], "nomeNegocio": nome_negocio_fn(t["table"]),
        "dominioId": dom.id, "dominioLabel": dom.label,
        "columns": t["columns"], "pk": t["pk"],
        "fks": [{"column": fk["column"], "refTable": fk["ref_table"], "refColumn": fk["ref_column"]}
                for fk in t["fks"]],
        "count": t["count"] or 0, "countEstimated": t["count_estimated"], "totalBytes": t["total_bytes"],
        "sugestaoClasse": sug_cls, "sugestaoRotulo": sug_rot,
        "risco": calcular_risco_fn(t, dom, anotacoes),
        "nota": anotacoes.get(t["table"], ""), "mapeada": t["table"] in mapeadas,
    }


def montar_resumo_dominios(tabelas, dominios):
    resumo = {d.id: {"dominioId": d.id, "label": d.label, "total": 0, "vazias": 0, "registros": 0}
              for d in dominios}
    for t in tabelas:
        r = resumo[t["dominioId"]]
        r["total"] += 1
        r["vazias"] += t["count"] == 0
        r["registros"] += t["count"]
    return [r for r in resumo.values() if r["total"] > 0]


def montar_pareto(tabelas, top=10):
    ordenadas = sorted(tabelas, key=lambda t: -t["count"])[:top]
    total = sum(t["count"] for t in tabelas)
    acumulado = 0
    out = []
    for t in ordenadas:
        acumulado += t["count"]
        out.append({
            "table": t["table"], "nomeNegocio": t["nomeNegocio"], "registros": t["count"],
            "acumuladoPct": round(100 * acumulado / total, 1) if total else 0,
        })
    return out


def montar_der(tabelas_brutas, dominio_fn):
    ativos = [t for t in tabelas_brutas if t["count"]]
    por_dominio: dict[str, list] = {}
    for t in ativos:
        por_dominio.setdefault(dominio_fn(t["table"]).id, []).append(t)
    return {
        dom_id: diagram(sorted(ts, key=lambda t: -t["count"]), com_colunas=len(ts) <= 12)
        for dom_id, ts in por_dominio.items()
    }


def montar_sql(tabelas, titulo_banco):
    linhas = [
        f"-- Consultas de verificação — {titulo_banco} · acesso somente leitura",
        f"-- Geradas em {date.today():%d/%m/%Y} pelo mapeamento-banco-eds",
        "",
        "-- 1. Contagem aproximada e instantânea de todas as tabelas",
        "SELECT relname AS tabela, n_live_tup AS registros_aprox",
        "FROM pg_stat_user_tables ORDER BY n_live_tup DESC;",
        "",
        "-- 2. Tabelas sem uso (zero registros) — usa contagem exata",
        "SELECT c.relname AS tabela",
        "FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace",
        "WHERE n.nspname = 'public' AND c.relkind = 'r'",
        "  AND NOT EXISTS (SELECT 1 FROM pg_stat_user_tables s WHERE s.relid = c.oid AND s.n_live_tup > 0)",
        "ORDER BY 1;",
        "",
        "-- 3. Tamanho em disco por tabela",
        "SELECT relname AS tabela, pg_size_pretty(pg_total_relation_size(relid)) AS tamanho",
        "FROM pg_stat_user_tables ORDER BY pg_total_relation_size(relid) DESC;",
        "",
        "-- 4. Amostra de dados por tabela (uma consulta por tabela, LIMIT 100)",
    ]
    for t in sorted(tabelas, key=lambda t: -t["count"]):
        linhas.append(f'SELECT * FROM public."{t["table"]}" LIMIT 100;  -- {t["count"]:,} registros'.replace(",", "."))
    return "\n".join(linhas)
