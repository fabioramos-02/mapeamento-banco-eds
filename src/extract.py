"""Extrai metadados, contagens e relacionamentos do banco EDS → data/inventario.json."""
import json
from pathlib import Path

from db import connect

OUT = Path(__file__).resolve().parent.parent / "data" / "inventario.json"

META_SQL = """
SELECT t.table_schema, t.table_name
FROM information_schema.tables t
WHERE t.table_type = 'BASE TABLE'
  AND t.table_schema NOT IN ('pg_catalog', 'information_schema')
ORDER BY t.table_schema, t.table_name
"""

COLS_SQL = """
SELECT table_schema, table_name, column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
ORDER BY table_schema, table_name, ordinal_position
"""

PK_SQL = """
SELECT n.nspname, c.relname, a.attname
FROM pg_constraint con
JOIN pg_class c ON c.oid = con.conrelid
JOIN pg_namespace n ON n.oid = c.relnamespace
JOIN unnest(con.conkey) AS k(attnum) ON true
JOIN pg_attribute a ON a.attrelid = c.oid AND a.attnum = k.attnum
WHERE con.contype = 'p'
  AND n.nspname NOT IN ('pg_catalog', 'information_schema')
"""

FK_SQL = """
SELECT n.nspname, c.relname, a.attname, fn.nspname, fc.relname, fa.attname
FROM pg_constraint con
JOIN pg_class c ON c.oid = con.conrelid
JOIN pg_namespace n ON n.oid = c.relnamespace
JOIN pg_class fc ON fc.oid = con.confrelid
JOIN pg_namespace fn ON fn.oid = fc.relnamespace
JOIN unnest(con.conkey) WITH ORDINALITY AS k(attnum, ord) ON true
JOIN unnest(con.confkey) WITH ORDINALITY AS fk(attnum, ord) ON fk.ord = k.ord
JOIN pg_attribute a ON a.attrelid = c.oid AND a.attnum = k.attnum
JOIN pg_attribute fa ON fa.attrelid = fc.oid AND fa.attnum = fk.attnum
WHERE con.contype = 'f'
  AND n.nspname NOT IN ('pg_catalog', 'information_schema')
"""

STATS_SQL = """
SELECT schemaname, relname,
       pg_total_relation_size(relid) AS total_bytes,
       n_tup_ins, n_tup_upd, n_tup_del,
       GREATEST(last_autoanalyze, last_analyze)::date::text AS last_analyze
FROM pg_stat_user_tables
"""


def main():
    inv = {}
    with connect() as conn, conn.cursor() as cur:
        cur.execute(META_SQL)
        for schema, table in cur.fetchall():
            inv[f"{schema}.{table}"] = {
                "schema": schema, "table": table, "columns": [],
                "pk": [], "fks": [], "count": None, "count_estimated": False,
                "total_bytes": 0, "stats": {},
            }

        cur.execute(COLS_SQL)
        for schema, table, col, dtype, nullable in cur.fetchall():
            key = f"{schema}.{table}"
            if key in inv:
                inv[key]["columns"].append({"name": col, "type": dtype, "nullable": nullable == "YES"})

        cur.execute(PK_SQL)
        for schema, table, col in cur.fetchall():
            key = f"{schema}.{table}"
            if key in inv:
                inv[key]["pk"].append(col)

        cur.execute(FK_SQL)
        for schema, table, col, fschema, ftable, fcol in cur.fetchall():
            key = f"{schema}.{table}"
            if key in inv:
                inv[key]["fks"].append({"column": col, "ref_table": f"{fschema}.{ftable}", "ref_column": fcol})

        cur.execute(STATS_SQL)
        for schema, table, size, ins, upd, dele, last in cur.fetchall():
            key = f"{schema}.{table}"
            if key in inv:
                inv[key]["total_bytes"] = size
                inv[key]["stats"] = {"n_tup_ins": ins, "n_tup_upd": upd, "n_tup_del": dele, "last_analyze": last}

        for key, t in inv.items():
            try:
                cur.execute(f'SELECT count(*) FROM "{t["schema"]}"."{t["table"]}"')
                t["count"] = cur.fetchone()[0]
            except Exception as e:
                conn.rollback()
                # ponytail: fallback estimado só se count exato falhar (timeout/permissão)
                cur.execute(
                    "SELECT reltuples::bigint FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace "
                    "WHERE n.nspname=%s AND c.relname=%s", (t["schema"], t["table"]))
                row = cur.fetchone()
                t["count"] = row[0] if row else None
                t["count_estimated"] = True
                print(f"  aviso: count exato falhou em {key}: {e}")

    OUT.parent.mkdir(exist_ok=True)
    OUT.write_text(json.dumps(inv, indent=1, ensure_ascii=False), encoding="utf-8")

    total = len(inv)
    vazias = sum(1 for t in inv.values() if t["count"] == 0)
    registros = sum(t["count"] or 0 for t in inv.values())
    print(f"{total} tabelas | {vazias} vazias | {registros:,} registros | -> {OUT}")


if __name__ == "__main__":
    main()
