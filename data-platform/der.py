"""Gera DER Mermaid (erDiagram) por domínio a partir de data/inventario.json → output/der.mmd."""
import json
from pathlib import Path

from config_dominios import dominio

BASE = Path(__file__).resolve().parent.parent
OUT = BASE / "output" / "der.mmd"


def _entity(t, max_cols=8):
    """Entidade com PK, FKs e primeiras colunas (limite p/ legibilidade)."""
    lines = [f"    {t['table']} {{"]
    shown = set()
    for col in t["columns"]:
        marks = []
        if col["name"] in t["pk"]:
            marks.append("PK")
        if any(fk["column"] == col["name"] for fk in t["fks"]):
            marks.append("FK")
        if marks or len(shown) < max_cols:
            ctype = col["type"].replace(" ", "_")
            lines.append(f"        {ctype} {col['name']} {','.join(marks)}".rstrip())
            shown.add(col["name"])
    lines.append("    }")
    return "\n".join(lines)


def diagram(tables, com_colunas=True):
    """erDiagram das tabelas dadas; relações só entre tabelas do conjunto."""
    names = {t["table"] for t in tables}
    out = ["erDiagram"]
    if com_colunas:
        for t in tables:
            out.append(_entity(t))
    rels = set()
    for t in tables:
        for fk in t["fks"]:
            ref = fk["ref_table"].split(".")[-1]
            if ref in names and (t["table"], ref, fk["column"]) not in rels:
                rels.add((t["table"], ref, fk["column"]))
                out.append(f'    {t["table"]} }}o--|| {ref} : "{fk["column"]}"')
    return "\n".join(out)


def main():
    inv = json.load(open(BASE / "data" / "inventario.json", encoding="utf-8"))
    # ponytail: DER só das tabelas com dados — vazias não entram em discussão de migração
    ativos = [t for t in inv.values() if t["count"]]
    por_dominio = {}
    for t in ativos:
        por_dominio.setdefault(dominio(t["table"]).label, []).append(t)

    blocks = []
    for label in sorted(por_dominio):
        tables = sorted(por_dominio[label], key=lambda t: -t["count"])
        blocks.append(f"%% === {label} ({len(tables)} tabelas com dados) ===\n" + diagram(tables))

    OUT.parent.mkdir(exist_ok=True)
    OUT.write_text("\n\n".join(blocks), encoding="utf-8")
    print(f"{len(ativos)} tabelas com dados em {len(por_dominio)} domínios -> {OUT}")


if __name__ == "__main__":
    main()
