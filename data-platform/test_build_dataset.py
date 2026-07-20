"""Self-check de build_dataset.py — roda contra o data/inventario.json local já extraído.
ponytail: assert-based, sem pytest — projeto pequeno, um script de verificação basta.
"""
import json
from pathlib import Path

from build_dataset import main

BASE = Path(__file__).resolve().parent.parent
OUT_JSON = BASE / "datasets" / "eds" / "v1" / "inventario.json"


def demo():
    main()
    ds = json.load(open(OUT_JSON, encoding="utf-8"))

    tabelas = ds["tabelas"]
    assert len(tabelas) > 0, "dataset sem tabelas"
    for t in tabelas:
        assert t["risco"] in ("alto", "medio", "baixo"), t["table"]
        assert t["sugestaoClasse"] in ("nao-migrar", "tecnica", "avaliar", "migrar"), t["table"]
        assert t["nomeNegocio"], t["table"]
        assert t["dominioId"], t["table"]

    soma_decisao = sum(ds["decisao"].values())
    assert soma_decisao == len(tabelas), f"decisao soma {soma_decisao} != {len(tabelas)} tabelas"

    por_tabela = {t["table"]: t for t in tabelas}
    assert por_tabela["auth_user"]["risco"] == "alto", "auth_user deveria ser risco alto"
    assert por_tabela["gerenciamento_servicos"]["risco"] == "alto", "gerenciamento_servicos deveria ser risco alto"

    vazias = [t for t in tabelas if t["count"] == 0]
    assert all(t["sugestaoClasse"] == "nao-migrar" for t in vazias), "tabela vazia sem sugestão nao-migrar"

    pareto = ds["paretoTop10"]
    assert len(pareto) == 10
    assert pareto[0]["registros"] >= pareto[-1]["registros"], "pareto não está ordenado"
    assert pareto[-1]["acumuladoPct"] <= 100

    assert ds["der"], "DER vazio"
    assert ds["dominios"], "domínios vazio"
    assert any(d["critico"] for d in ds["dominios"]), "nenhum domínio crítico"

    print(f"OK — {len(tabelas)} tabelas, decisão {ds['decisao']}")


if __name__ == "__main__":
    demo()
