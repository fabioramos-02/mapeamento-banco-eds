"""Gera Mermaid erDiagram por conjunto de tabelas — usado por build_dataset.py."""


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
