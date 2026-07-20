"""Conexão única com o banco EDS (admin_prd), somente leitura."""
import os
from pathlib import Path

import psycopg2

ENV_PATH = Path(__file__).resolve().parent.parent / ".env"


def _load_env():
    env = {}
    for line in ENV_PATH.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, value = line.partition("=")
        env[key.strip()] = value.strip().strip('"')
    return env


def connect():
    env = _load_env()
    conn = psycopg2.connect(
        host=env["HOST"],
        port=env["PORT"],
        user=env["USER"],
        password=env["PASSWORD"],
        dbname=env["BANCO"],
        connect_timeout=15,
        options="-c default_transaction_read_only=on -c statement_timeout=120000",
    )
    conn.autocommit = True
    return conn


if __name__ == "__main__":
    with connect() as conn, conn.cursor() as cur:
        cur.execute("SELECT version(), current_database(), current_user")
        print(cur.fetchone())
