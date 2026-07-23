"""Extrai a relação de sistemas externos integrados ao Controlador via govBR
→ data/sistemas_controlador.json.

Duas visões complementares:
- "gsi": acessos por sistema (authentication_acessossistemagsi) — volume bruto de
  acesso, nome/sigla estáveis por system_id (confirmado: count(distinct) = 1 cada).
- "govbr": sistemas OAuth2 (oauth2_provider_application) que de fato completaram
  login (oauth2_provider_grant) ou assinatura govBR (authentication_assinaturagovbr,
  concluido=true) — responde "quantos sistemas realmente autenticaram via govBR",
  que é mais preciso que só contar acesso GSI.

ponytail: query específica de poucas tabelas — não vale generalizar extract.py por
causa disso.
"""
import json
from pathlib import Path

from db import connect

OUT = Path(__file__).resolve().parent.parent / "data" / "sistemas_controlador.json"

SQL_GSI = """
SELECT system_id, MIN(sigla) AS sigla, MIN(nome) AS nome, count(*) AS registros
FROM authentication_acessossistemagsi
GROUP BY system_id
ORDER BY registros DESC
"""

SQL_APPS_REGISTRADOS = "SELECT count(*) FROM oauth2_provider_application"

SQL_LOGIN_GOVBR = """
SELECT o.name, count(*) AS logins
FROM oauth2_provider_grant g
JOIN oauth2_provider_application o ON o.id = g.application_id
GROUP BY o.name
ORDER BY logins DESC
"""

SQL_ASSINATURA_GOVBR = """
SELECT o.name, count(*) AS assinaturas
FROM authentication_assinaturagovbr a
JOIN oauth2_provider_application o ON o.id = a.app_id
WHERE a.concluido
GROUP BY o.name
ORDER BY assinaturas DESC
"""


def main():
    with connect("BANCO_CONTROLADOR") as conn, conn.cursor() as cur:
        cur.execute(SQL_GSI)
        gsi = [
            {"systemId": system_id, "sigla": sigla, "nome": nome, "registros": registros}
            for system_id, sigla, nome, registros in cur.fetchall()
        ]

        cur.execute(SQL_APPS_REGISTRADOS)
        apps_registrados = cur.fetchone()[0]

        cur.execute(SQL_LOGIN_GOVBR)
        login = [{"nome": nome, "registros": n} for nome, n in cur.fetchall()]

        cur.execute(SQL_ASSINATURA_GOVBR)
        assinatura = [{"nome": nome, "registros": n} for nome, n in cur.fetchall()]

    resultado = {
        "gsi": gsi,
        "govbr": {
            "appsRegistrados": apps_registrados,
            "appsComLoginGovbr": len(login),
            "appsComAssinaturaGovbr": len(assinatura),
            "porLogin": login,
            "porAssinatura": assinatura,
        },
    }

    OUT.parent.mkdir(exist_ok=True)
    OUT.write_text(json.dumps(resultado, indent=1, ensure_ascii=False), encoding="utf-8")

    print(f"{len(gsi)} sistemas GSI | {apps_registrados} apps OAuth2 registrados | "
          f"{len(login)} com login govBR | {len(assinatura)} com assinatura govBR -> {OUT}")


if __name__ == "__main__":
    main()
