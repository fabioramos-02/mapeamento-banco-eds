"""Junta inventario.json bruto + domínios + nomes de negócio + risco + anotações + DER
em datasets/eds/v1/inventario.json (versionado, consumido pelo app Next.js) e public/consultas.sql.

Não toca o banco — só transforma o que extract.py já extraiu.
"""
import json
from datetime import date, datetime, timezone
from pathlib import Path

from anotacoes_glau import ANOTACOES, MAPEADAS, PERGUNTAS_ABERTAS
from config_dominios import DOMINIOS, dominio
from der import diagram
from nomes_negocio import nome_negocio
from risco import calcular_risco

BASE = Path(__file__).resolve().parent.parent
IN_PATH = BASE / "data" / "inventario.json"
OUT_JSON = BASE / "datasets" / "eds" / "v1" / "inventario.json"
OUT_SQL = BASE / "public" / "consultas.sql"

# Credenciais/sessões: dado volátil, recriado pela nova plataforma — não "migra", "recria"
TABELAS_TOKEN = {
    "authtoken_token", "gerenciamento_accesstoken", "gerenciamento_osastoken",
    "rest_framework_api_key_apikey",
}

SUGESTAO_TO_DECISAO = {
    "nao-migrar": "descartar", "tecnica": "recriar", "avaliar": "avaliar", "migrar": "migrar",
}


def sugestao(t, dom):
    """(classe, rotulo) — proposta inicial; decisão final é da gestão."""
    if t["count"] == 0:
        return "nao-migrar", "Sem uso — não migrar"
    if dom.id == "infra-django":
        return "tecnica", "Infra do sistema — recriar"
    if t["table"] in TABELAS_TOKEN:
        return "tecnica", "Credenciais — recriar"
    nota = ANOTACOES.get(t["table"], "")
    if "?" in nota or "ntender" in nota:
        return "avaliar", "Avaliar"
    return "migrar", "Migrar"


def montar_tabela(t):
    dom = dominio(t["table"])
    sug_cls, sug_rot = sugestao(t, dom)
    return {
        "schema": t["schema"], "table": t["table"], "nomeNegocio": nome_negocio(t["table"]),
        "dominioId": dom.id, "dominioLabel": dom.label,
        "columns": t["columns"], "pk": t["pk"],
        "fks": [{"column": fk["column"], "refTable": fk["ref_table"], "refColumn": fk["ref_column"]}
                for fk in t["fks"]],
        "count": t["count"] or 0, "countEstimated": t["count_estimated"], "totalBytes": t["total_bytes"],
        "sugestaoClasse": sug_cls, "sugestaoRotulo": sug_rot,
        "risco": calcular_risco(t, dom),
        "nota": ANOTACOES.get(t["table"], ""), "mapeada": t["table"] in MAPEADAS,
    }


def montar_resumo_dominios(tabelas):
    resumo = {d.id: {"dominioId": d.id, "label": d.label, "total": 0, "vazias": 0, "registros": 0}
              for d in DOMINIOS}
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


def montar_der(tabelas_brutas):
    ativos = [t for t in tabelas_brutas if t["count"]]
    por_dominio: dict[str, list] = {}
    for t in ativos:
        por_dominio.setdefault(dominio(t["table"]).id, []).append(t)
    return {
        dom_id: diagram(sorted(ts, key=lambda t: -t["count"]), com_colunas=len(ts) <= 12)
        for dom_id, ts in por_dominio.items()
    }


def montar_sql(tabelas):
    linhas = [
        "-- Consultas de verificação — Banco EDS (admin_prd) · acesso somente leitura",
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


def main():
    inv_bruto = json.load(open(IN_PATH, encoding="utf-8"))
    tabelas = [montar_tabela(t) for t in inv_bruto.values()]
    tabelas.sort(key=lambda t: -t["count"])

    decisao = {"descartar": 0, "avaliar": 0, "migrar": 0, "recriar": 0}
    for t in tabelas:
        decisao[SUGESTAO_TO_DECISAO[t["sugestaoClasse"]]] += 1

    dataset = {
        "extraidoEm": datetime.now(timezone.utc).isoformat(),
        "tabelas": tabelas,
        "dominios": [{"id": d.id, "label": d.label, "descricao": d.descricao, "critico": d.critico}
                     for d in DOMINIOS],
        "resumoDominios": montar_resumo_dominios(tabelas),
        "decisao": decisao,
        "paretoTop10": montar_pareto(tabelas),
        "perguntasAbertas": PERGUNTAS_ABERTAS,
        "der": montar_der(inv_bruto.values()),
    }

    OUT_JSON.parent.mkdir(parents=True, exist_ok=True)
    OUT_JSON.write_text(json.dumps(dataset, indent=1, ensure_ascii=False), encoding="utf-8")

    OUT_SQL.parent.mkdir(parents=True, exist_ok=True)
    OUT_SQL.write_text(montar_sql(tabelas), encoding="utf-8")

    total = len(tabelas)
    vazias = decisao["descartar"]
    print(f"{total} tabelas | decisão: {decisao} | {vazias} vazias -> {OUT_JSON}")
    print(f"sql -> {OUT_SQL}")


if __name__ == "__main__":
    main()
