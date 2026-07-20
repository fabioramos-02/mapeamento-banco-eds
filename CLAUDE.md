# mapeamento-banco-eds

## Contexto de negócio

SETDIG (Secretaria-Executiva de Transformação Digital, MS) está migrando a plataforma **EDS** para a **XVia** (Contrato nº 004/2026, R$ 14,3M — ver vault Obsidian `20-projeto/xvia-migracao-eds/`). Este projeto responde uma pergunta específica dentro dessa transição: **o que existe hoje no banco de dados da EDS, e o que vale a pena migrar?**

O produto é um relatório executivo (não uma ferramenta interna) para levar à alta gestão como base de discussão: quantas tabelas existem, quantas estão em uso, onde está concentrado o volume, e uma proposta inicial de risco/sugestão por tabela. A decisão final de migrar/descartar é da gestão — este projeto só instrumenta a decisão.

Insumo original: [anotacoes/mapeamento-glau-20-07.txt](anotacoes/mapeamento-glau-20-07.txt), mapeamento manual feito pela Glau com anotações sobre ~60 tabelas.

## Stack

Dois mundos separados por design:

- **`data-platform/` (Python)** — só isso toca o banco Postgres, via VPN/rede do governo, acesso somente leitura. Roda localmente, sob demanda.
- **`src/` (Next.js 16 App Router, React 19, TypeScript, Tailwind v4)** — relatório executivo. Lê só `datasets/eds/v1/inventario.json` (arquivo estático versionado), nunca toca o banco. 100% SSG — builda e publica na Vercel sem nenhuma variável de ambiente.

Design system: vendorizado (copiado) de `../bi-setdig/src/styles/ds-sis/` — mesma origem, mesmo motivo do projeto irmão (pacote npm `@design-system-ms/ds-sis` está deprecated sem `dist/`). Componentes de storytelling (`StoryCard`, `MetricCard`, `DashboardSection`, `DataTable`, `Select`, `CategoryDonut`) também copiados de `bi-setdig` — mesmo padrão de BI governamental.

## Comandos

```bash
# Pipeline de dados (precisa VPN — só isso toca o banco)
python data-platform/extract.py        # → data/inventario.json (bruto, local, gitignored)
python data-platform/build_dataset.py  # → datasets/eds/v1/inventario.json + public/consultas.sql
python data-platform/test_build_dataset.py  # self-check (assert-based, sem pytest)

# App (não precisa VPN — lê só datasets/)
npm install
npm run dev      # http://localhost:3000
npm run build
npm run lint
```

## Estrutura de pastas

```
data-platform/          # Python — extração e enriquecimento
  db.py                 # conexão única (lê .env, força somente leitura)
  extract.py             # metadados + count(*) exato + tamanho → data/inventario.json
  config_dominios.py     # blocos funcionais (Dominio: id, label, descrição, critico)
  nomes_negocio.py        # tradução nome técnico → nome de negócio
  risco.py                 # calcular_risco(tabela, dominio) → alto/medio/baixo
  anotacoes_glau.py         # anotações do mapeamento manual + perguntas em aberto
  der.py                    # gera Mermaid erDiagram a partir das FKs
  build_dataset.py           # junta tudo em datasets/eds/v1/inventario.json
  test_build_dataset.py       # self-check

data/inventario.json    # bruto, LOCAL, gitignored — saída de extract.py
datasets/eds/v1/inventario.json  # enriquecido, VERSIONADO — o que o app lê
public/consultas.sql     # SELECTs prontos, VERSIONADO, baixável em /consultas.sql

src/
  app/
    page.tsx              # narrativa executiva: 7 seções (A Decisão → Roadmap)
    inventario/page.tsx    # inventário completo, pesquisável/filtrável
    tecnico/page.tsx        # anexo técnico: DER (Mermaid lazy) + SQL completo
  components/
    dashboard/             # StoryCard, MetricCard, DashboardSection, DataTable, Select — de bi-setdig
    charts/                 # CategoryDonut (de bi-setdig) + ParetoChart, DomainTreemap (novos)
    relatorio/               # seções específicas deste relatório + GovHeader + Badges
  lib/
    data.ts                  # único ponto de leitura do dataset (fs.readFileSync, build-time)
    format.ts, categorical-palette.ts
  styles/ds-sis/               # design system vendorizado (cópia de bi-setdig)
```

## Fluxo de dados

```
extract.py (VPN, único ponto que toca o banco)
  → data/inventario.json                 [bruto, local, gitignored]
       ↓
build_dataset.py (Python puro, sem banco)
  → datasets/eds/v1/inventario.json       [enriquecido, VERSIONADO]
  → public/consultas.sql                  [VERSIONADO]
       ↓
src/lib/data.ts::getInventarioEds()        (leitura de arquivo, build-time/SSG)
       ↓
app/page.tsx, /inventario, /tecnico
```

Toda a matemática (percentuais, Pareto acumulado, risco, sugestão) é calculada uma vez em Python — o TypeScript nunca duplica essa lógica.

## Onde estender

- **Domínio de negócio novo**: acrescentar um `Dominio(...)` em [data-platform/config_dominios.py](data-platform/config_dominios.py). `critico=True` baixa a barra de risco "alto" para tabelas desse domínio.
- **Nome de negócio de uma tabela**: curar em `NOMES_NEGOCIO` de [data-platform/nomes_negocio.py](data-platform/nomes_negocio.py). Tabelas sem entrada caem no fallback automático `_humanizar()`.
- **Regra de risco**: [data-platform/risco.py](data-platform/risco.py) — `VOLUME_ALTO`/`VOLUME_MEDIO` e a lógica de `calcular_risco()`.
- Depois de qualquer mudança em `data-platform/`, rodar `python data-platform/build_dataset.py` de novo para regenerar o dataset que o app consome.

## Dados sensíveis

- `.env` (credencial do banco) **nunca é commitado** — está no `.gitignore`. Conexão em `db.py` força `default_transaction_read_only=on`.
- Banco só é acessível via VPN/rede interna do governo.
- `data/inventario.json` é bruto e fica **local, gitignored** (schema completo, inclusive tabelas de infraestrutura).
- `datasets/eds/v1/inventario.json` é **versionado** — só metadados agregados (contagens, nomes, domínios), sem segredo. É o que builda na Vercel.

## Convenções

- Filosofia ponytail: menor diff que funciona, reusar em vez de reinventar, comentário `// ponytail: ...` / `# ponytail: ...` em toda simplificação deliberada.
- Cor sempre via `var(--ds-color-*)` — nunca hex hardcoded, mesma regra de `bi-setdig`.
- pt-BR em toda UI e conteúdo.
- `main` em `page.tsx` usa `grid`, não `flex flex-col` — flex column aninhado com texto longo causa overflow horizontal em mobile (min-content bug clássico do flexbox). Ver commit que corrigiu isso se precisar do contexto completo.

## Deploy

Projeto Vercel já existe: `prj_QMJeusBzTvado0xW9is9fjfSevO4`. Sem `vercel.json` no repo (mesmo padrão de `bi-setdig` — config só no dashboard). Sem variáveis de ambiente necessárias (SSG puro). Ver seção de deploy do plano de implementação para o passo a passo de `vercel link`.

## Referência

`../bi-setdig` é o projeto irmão (portal de BI da SETDIG) e a fonte de padrão de design system, storytelling e stack — sempre que uma dúvida de estilo ou de componente surgir, checar lá primeiro.
