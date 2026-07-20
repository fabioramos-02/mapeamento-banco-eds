# Mapeamento do Banco EDS

Levantamento do banco `admin_prd` da EDS (PostgreSQL 13.8) para subsidiar a decisão de
migração de dados na transição EDS → XVia. Gera inventário com contagens exatas,
DER por bloco funcional e relatório HTML para a alta gestão.

## Como rodar

```bash
python src/extract.py   # conecta no banco (leitura) e gera data/inventario.json
python src/der.py       # gera output/der.mmd (Mermaid, por domínio)
python src/report.py    # gera output/relatorio.html + output/consultas.sql
```

Requisitos: Python 3 + `psycopg2-binary`. Acesso ao banco exige rede do governo.

## Estrutura

| Caminho | Responsabilidade |
|---|---|
| `src/db.py` | Conexão única (lê `.env`, força sessão somente leitura) |
| `src/extract.py` | Metadados, PK/FK, `count(*)` exato e tamanho por tabela |
| `src/dominios.py` | Classificação das tabelas em blocos funcionais |
| `src/anotacoes_glau.py` | Anotações do mapeamento manual de 20/07 |
| `src/der.py` | DER Mermaid a partir das FKs reais |
| `src/report.py` | Relatório HTML (tokens do Design System MS) + anexo SQL |
| `output/relatorio.html` | Entregável principal — abre em qualquer navegador |
| `anotacoes/` | Insumos manuais |

## Segurança

- `.env` contém credencial em texto plano — **está no `.gitignore`, nunca commitar**.
- A conexão força `default_transaction_read_only=on` e `statement_timeout` de 2 min.

## Nota sobre estilo

O CSS do relatório espelha os tokens do `@design-system-ms/ds-sis` inline (relatório é um
HTML estático autocontido). Se o projeto virar app, consumir o pacote npm em vez da cópia.
