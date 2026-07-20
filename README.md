# Mapeamento do Banco EDS

Levantamento do banco `admin_prd` da EDS (PostgreSQL 13.8) para subsidiar a decisão de
migração de dados na transição EDS → XVia. Extrai inventário com contagens exatas e
publica um relatório executivo (Next.js) para a alta gestão.

Ver [CLAUDE.md](CLAUDE.md) para contexto completo do projeto.

## Como rodar

```bash
# Pipeline de dados (Python, precisa de VPN/rede do governo)
python data-platform/extract.py        # conecta no banco (leitura) → data/inventario.json
python data-platform/build_dataset.py  # enriquece → datasets/eds/v1/inventario.json + public/consultas.sql

# App (Next.js, lê só datasets/ — não toca o banco)
npm install
npm run dev      # http://localhost:3000
npm run build
```

Requisitos: Python 3 + `psycopg2-binary`; Node 22+.

## Estrutura

| Caminho | Responsabilidade |
|---|---|
| `data-platform/db.py` | Conexão única (lê `.env`, força sessão somente leitura) |
| `data-platform/extract.py` | Metadados, PK/FK, `count(*)` exato e tamanho por tabela → `data/inventario.json` |
| `data-platform/config_dominios.py` | Classificação das tabelas em blocos funcionais |
| `data-platform/nomes_negocio.py` | Tradução de nome técnico → nome de negócio |
| `data-platform/risco.py` | Classificação de risco de migração por tabela |
| `data-platform/anotacoes_glau.py` | Anotações do mapeamento manual de 20/07 |
| `data-platform/der.py` | DER Mermaid a partir das FKs reais |
| `data-platform/build_dataset.py` | Junta tudo em `datasets/eds/v1/inventario.json` |
| `datasets/eds/v1/inventario.json` | Dataset publicado (versionado) — o app Next.js lê só isso |
| `src/app/` | Relatório executivo Next.js (`/`, `/inventario`, `/tecnico`) |
| `anotacoes/` | Insumos manuais |

## Segurança

- `.env` contém credencial em texto plano — **está no `.gitignore`, nunca commitar**.
- A conexão força `default_transaction_read_only=on` e `statement_timeout` de 2 min.
- `data/inventario.json` (bruto) fica local, gitignored. Só `datasets/` (agregados, sem segredo) é versionado.
