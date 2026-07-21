"""Junta inventario_controlador.json bruto + domínios auto-derivados + DER
em datasets/controlador/v1/inventario.json e public/consultas-controlador.sql.

Primeira rodada sem curadoria manual de negócio — ver config_dominios_controlador.py
e anotacoes_controlador.py. Não toca o banco — só transforma o que extract.py já extraiu.
"""
import json
from datetime import datetime, timezone
from pathlib import Path

from anotacoes_controlador import ANOTACOES, MAPEADAS, PERGUNTAS_ABERTAS
from build_dataset_common import SUGESTAO_TO_DECISAO, montar_der, montar_pareto, montar_resumo_dominios, montar_sql, montar_tabela
from config_dominios_controlador import dominio, dominios_encontrados
from nomes_negocio import nome_negocio
from risco import calcular_risco

BASE = Path(__file__).resolve().parent.parent
IN_PATH = BASE / "data" / "inventario_controlador.json"
OUT_JSON = BASE / "datasets" / "controlador" / "v1" / "inventario.json"
OUT_SQL = BASE / "public" / "consultas-controlador.sql"


def main():
    inv_bruto = json.load(open(IN_PATH, encoding="utf-8"))
    tabelas = [
        montar_tabela(t, dominio, nome_negocio, calcular_risco, ANOTACOES, MAPEADAS)
        for t in inv_bruto.values()
    ]
    tabelas.sort(key=lambda t: -t["count"])

    # domínios só existem depois de rodar dominio() para cada tabela (cache lazy)
    dominios = dominios_encontrados()

    decisao = {"descartar": 0, "avaliar": 0, "migrar": 0, "recriar": 0}
    for t in tabelas:
        decisao[SUGESTAO_TO_DECISAO[t["sugestaoClasse"]]] += 1

    dataset = {
        "extraidoEm": datetime.now(timezone.utc).isoformat(),
        "tabelas": tabelas,
        "dominios": [{"id": d.id, "label": d.label, "descricao": d.descricao, "critico": d.critico}
                     for d in dominios],
        "resumoDominios": montar_resumo_dominios(tabelas, dominios),
        "decisao": decisao,
        "paretoTop10": montar_pareto(tabelas),
        "perguntasAbertas": PERGUNTAS_ABERTAS,
        "der": montar_der(inv_bruto.values(), dominio),
    }

    OUT_JSON.parent.mkdir(parents=True, exist_ok=True)
    OUT_JSON.write_text(json.dumps(dataset, indent=1, ensure_ascii=False), encoding="utf-8")

    OUT_SQL.parent.mkdir(parents=True, exist_ok=True)
    OUT_SQL.write_text(montar_sql(tabelas, "Banco Controlador (controlador_prd)"), encoding="utf-8")

    total = len(tabelas)
    vazias = decisao["descartar"]
    print(f"{total} tabelas | decisão: {decisao} | {vazias} vazias -> {OUT_JSON}")
    print(f"sql -> {OUT_SQL}")


if __name__ == "__main__":
    main()
