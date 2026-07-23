"""Junta inventario.json bruto + domínios + nomes de negócio + risco + anotações + DER
em datasets/admin/v1/inventario.json (versionado, consumido pelo app Next.js) e public/consultas-admin.sql.

Não toca o banco — só transforma o que extract.py já extraiu.
"""
import json
from datetime import datetime, timezone
from pathlib import Path

from anotacoes_glau import ANOTACOES, MAPEADAS, PERGUNTAS_ABERTAS
from build_dataset_common import (
    SUGESTAO_TO_DECISAO, montar_der, montar_pareto, montar_resumo_dominios, montar_sql, montar_tabela,
)
from config_dominios import DOMINIOS, dominio
from nomes_negocio import nome_negocio
from risco import calcular_risco

BASE = Path(__file__).resolve().parent.parent
IN_PATH = BASE / "data" / "inventario.json"
OUT_JSON = BASE / "datasets" / "admin" / "v1" / "inventario.json"
OUT_SQL = BASE / "public" / "consultas-admin.sql"

# Credenciais/sessões: dado volátil, recriado pela nova plataforma — não "migra", "recria"
TABELAS_TOKEN = {
    "authtoken_token", "gerenciamento_accesstoken", "gerenciamento_osastoken",
    "rest_framework_api_key_apikey",
}


def main():
    inv_bruto = json.load(open(IN_PATH, encoding="utf-8"))
    tabelas = [
        montar_tabela(t, dominio, nome_negocio, calcular_risco, ANOTACOES, MAPEADAS,
                      tabelas_token=TABELAS_TOKEN, dominio_infra_id="infra-django")
        for t in inv_bruto.values()
    ]
    tabelas.sort(key=lambda t: -t["count"])

    decisao = {"descartar": 0, "avaliar": 0, "migrar": 0, "recriar": 0}
    for t in tabelas:
        decisao[SUGESTAO_TO_DECISAO[t["sugestaoClasse"]]] += 1

    dataset = {
        "extraidoEm": datetime.now(timezone.utc).isoformat(),
        "tabelas": tabelas,
        "dominios": [{"id": d.id, "label": d.label, "descricao": d.descricao, "critico": d.critico}
                     for d in DOMINIOS],
        "resumoDominios": montar_resumo_dominios(tabelas, DOMINIOS),
        "decisao": decisao,
        "paretoTop10": montar_pareto(tabelas),
        "perguntasAbertas": PERGUNTAS_ABERTAS,
        "der": montar_der(inv_bruto.values(), dominio),
        "porSistema": [],  # dimensão só existe no Controlador (acessos GSI por sistema externo)
        "govbr": {"appsRegistrados": 0, "appsComLoginGovbr": 0, "appsComAssinaturaGovbr": 0, "porLogin": [], "porAssinatura": []},
    }

    OUT_JSON.parent.mkdir(parents=True, exist_ok=True)
    OUT_JSON.write_text(json.dumps(dataset, indent=1, ensure_ascii=False), encoding="utf-8")

    OUT_SQL.parent.mkdir(parents=True, exist_ok=True)
    OUT_SQL.write_text(montar_sql(tabelas, "Banco EDS (admin_prd)"), encoding="utf-8")

    total = len(tabelas)
    vazias = decisao["descartar"]
    print(f"{total} tabelas | decisão: {decisao} | {vazias} vazias -> {OUT_JSON}")
    print(f"sql -> {OUT_SQL}")


if __name__ == "__main__":
    main()
