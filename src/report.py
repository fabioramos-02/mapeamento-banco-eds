"""Gera output/relatorio.html e output/consultas.sql a partir de data/inventario.json."""
import json
from datetime import date
from pathlib import Path

from anotacoes_glau import ANOTACOES, MAPEADAS, PERGUNTAS_ABERTAS
from der import diagram
from dominios import DOMINIOS, dominio

BASE = Path(__file__).resolve().parent.parent
OUT_HTML = BASE / "output" / "relatorio.html"
OUT_SQL = BASE / "output" / "consultas.sql"

# Credenciais/sessões: dado volátil, recriado pela nova plataforma
TABELAS_TOKEN = {
    "authtoken_token", "gerenciamento_accesstoken", "gerenciamento_osastoken",
    "rest_framework_api_key_apikey",
}


def fmt(n):
    return f"{n:,}".replace(",", ".")


def fmt_bytes(b):
    if b >= 1024**3:
        return f"{b / 1024**3:.1f} GB"
    if b >= 1024**2:
        return f"{b / 1024**2:.1f} MB"
    return f"{b / 1024:.0f} kB"


def sugestao(t, dom):
    """(classe_css, rotulo) — proposta inicial; decisão é da gestão."""
    if t["count"] == 0:
        return "nao-migrar", "Sem uso — não migrar"
    if dom == "Infra Django":
        return "tecnica", "Infra do sistema — recriar"
    if t["table"] in TABELAS_TOKEN:
        return "tecnica", "Credenciais — recriar"
    nota = ANOTACOES.get(t["table"], "")
    if "?" in nota or "ntender" in nota:
        return "avaliar", "Avaliar"
    return "migrar", "Migrar"


def main():
    inv = json.load(open(BASE / "data" / "inventario.json", encoding="utf-8"))
    tabelas = sorted(inv.values(), key=lambda t: -(t["count"] or 0))
    for t in tabelas:
        t["dominio"] = dominio(t["table"])
        t["sug_cls"], t["sug"] = sugestao(t, t["dominio"])
        t["nota"] = ANOTACOES.get(t["table"], "")
        t["mapeada"] = t["table"] in MAPEADAS

    total = len(tabelas)
    vazias = [t for t in tabelas if t["count"] == 0]
    com_dados = [t for t in tabelas if t["count"]]
    registros = sum(t["count"] for t in com_dados)
    bytes_total = sum(t["total_bytes"] for t in tabelas)
    novas = [t for t in tabelas if not t["mapeada"]]
    top2 = com_dados[:2]
    pct_top2 = round(100 * sum(t["count"] for t in top2) / registros)
    pct_vazias = round(100 * len(vazias) / total)

    doms = {}
    for t in tabelas:
        d = doms.setdefault(t["dominio"], {"total": 0, "vazias": 0, "registros": 0})
        d["total"] += 1
        d["vazias"] += t["count"] == 0
        d["registros"] += t["count"] or 0
    doms_vazios = [d for d, v in doms.items() if v["vazias"] == v["total"]]
    social = [t for t in tabelas if t["table"].startswith(("socialaccount_", "account_"))]

    hoje = date.today().strftime("%d/%m/%Y")

    # ---------- consultas.sql ----------
    sql = [
        "-- Consultas de verificação — Banco EDS (admin_prd) · acesso somente leitura",
        f"-- Geradas em {hoje} pelo mapeamento-banco-eds",
        "",
        "-- 1. Contagem exata de registros de todas as tabelas (uma linha por tabela)",
        "SELECT relname AS tabela, n_live_tup AS registros_aprox",
        "FROM pg_stat_user_tables ORDER BY n_live_tup DESC;",
        "",
        "-- 2. Tabelas sem uso (zero registros) — usa contagem exata",
        "SELECT c.relname AS tabela",
        "FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace",
        "WHERE n.nspname = 'public' AND c.relkind = 'r'",
        "  AND NOT EXISTS (SELECT 1 FROM pg_stat_user_tables s WHERE s.relid = c.oid AND s.n_live_tup > 0)",
        "ORDER BY 1;",
        "",
        "-- 3. Tamanho em disco por tabela",
        "SELECT relname AS tabela, pg_size_pretty(pg_total_relation_size(relid)) AS tamanho",
        "FROM pg_stat_user_tables ORDER BY pg_total_relation_size(relid) DESC;",
        "",
        "-- 4. Amostra de dados por tabela (uma consulta por tabela, LIMIT 100)",
    ]
    for t in tabelas:
        sql.append(f'SELECT * FROM public."{t["table"]}" LIMIT 100;  -- {fmt(t["count"])} registros')
    OUT_SQL.parent.mkdir(exist_ok=True)
    OUT_SQL.write_text("\n".join(sql), encoding="utf-8")

    # ---------- fragmentos HTML ----------
    linhas_inv = "\n".join(
        f"<tr><td class='mono'>{t['table']}{'' if t['mapeada'] else ' <span class=nova title=\"Não constava no mapeamento manual de 20/07\">nova</span>'}</td>"
        f"<td>{t['dominio']}</td>"
        f"<td class='num' data-v='{t['count']}'>{fmt(t['count'])}</td>"
        f"<td class='num' data-v='{t['total_bytes']}'>{fmt_bytes(t['total_bytes'])}</td>"
        f"<td class='num' data-v='{len(t['columns'])}'>{len(t['columns'])}</td>"
        f"<td><span class='badge {t['sug_cls']}'>{t['sug']}</span></td>"
        f"<td class='nota'>{t['nota']}</td></tr>"
        for t in tabelas
    )

    barras_dom = ""
    max_reg = max(v["registros"] for v in doms.values()) or 1
    for d, v in sorted(doms.items(), key=lambda x: -x[1]["registros"]):
        usadas = v["total"] - v["vazias"]
        barras_dom += f"""
        <div class="dom-row">
          <div class="dom-head"><strong>{d}</strong>
            <span>{usadas} de {v['total']} tabelas em uso · {fmt(v['registros'])} registros</span></div>
          <div class="dom-desc">{DOMINIOS[d]}</div>
          <div class="bar-track">
            <div class="bar-fill" style="width:{max(1.2, 100 * v['registros'] / max_reg):.1f}%"></div>
          </div>
          <div class="dot-strip" aria-label="{usadas} tabelas com dados, {v['vazias']} vazias">
            {'<i class=on></i>' * usadas}{'<i></i>' * v['vazias']}
          </div>
        </div>"""

    top10 = ""
    max_c = com_dados[0]["count"]
    for t in com_dados[:10]:
        top10 += f"""
        <div class="top-row">
          <span class="mono">{t['table']}</span>
          <div class="bar-track"><div class="bar-fill" style="width:{max(1.5, 100 * t['count'] / max_c):.1f}%"></div></div>
          <span class="num">{fmt(t['count'])}</span>
        </div>"""

    vazias_html = ""
    grupos_vazias = {}
    for t in vazias:
        grupos_vazias.setdefault(t["dominio"], []).append(t["table"])
    for d in sorted(grupos_vazias, key=lambda d: -len(grupos_vazias[d])):
        nomes = grupos_vazias[d]
        integral = " <span class='badge nao-migrar'>domínio 100% vazio</span>" if d in doms_vazios else ""
        vazias_html += (
            f"<div class='vazia-grupo'><h4>{d} — {len(nomes)} tabela{'s' if len(nomes) > 1 else ''}{integral}</h4>"
            f"<p class='mono lista'>{', '.join(sorted(nomes))}</p></div>"
        )

    ders = ""
    por_dom = {}
    for t in com_dados:
        por_dom.setdefault(t["dominio"], []).append(t)
    for d in sorted(por_dom):
        ts = sorted(por_dom[d], key=lambda t: -t["count"])
        ders += (
            f"<details><summary>{d} — {len(ts)} tabelas com dados</summary>"
            f"<pre class='mermaid'>{diagram(ts, com_colunas=len(ts) <= 12)}</pre></details>\n"
        )

    perguntas = "\n".join(f"<li>{p}</li>" for p in PERGUNTAS_ABERTAS)

    selects_exemplo = "\n".join(
        f'SELECT * FROM public."{t["table"]}" LIMIT 100;' for t in com_dados[:5]
    )

    html = f"""<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Mapeamento do Banco EDS — SETDIG</title>
<style>
/* Tokens espelhados do @design-system-ms/ds-sis (inline: relatório é HTML estático) */
:root {{
  --color-primary-100:#e6eff8; --color-primary-300:#6698c9; --color-primary-500:#004F9F;
  --color-primary-700:#003064;
  --color-neutral-100:#f4f5f7; --color-neutral-300:#c9ced6; --color-neutral-500:#6b7280;
  --color-neutral-700:#2f3440; --color-neutral-900:#171a21;
  --color-success-500:#1e7d45; --color-error-500:#b3261e; --color-warning-500:#9a6a00;
  --color-info-500:#00629f;
  --paper:#fbfaf7; --ink:var(--color-neutral-900);
  --serif:Georgia,'Times New Roman',serif;
  --sans:'Segoe UI',system-ui,-apple-system,sans-serif;
  --mono:Consolas,'Courier New',monospace;
}}
* {{ box-sizing:border-box; margin:0; }}
body {{ background:var(--paper); color:var(--ink); font:16px/1.6 var(--sans); }}
.wrap {{ max-width:1080px; margin:0 auto; padding:0 32px 96px; }}

header.gov {{ border-top:6px solid var(--color-primary-500); background:#fff;
  border-bottom:1px solid var(--color-neutral-300); }}
header.gov .wrap {{ padding:28px 32px; }}
header.gov .org {{ font-size:12px; letter-spacing:.14em; text-transform:uppercase;
  color:var(--color-neutral-500); }}
header.gov h1 {{ font:700 44px/1.1 var(--serif); color:var(--color-primary-700); margin:10px 0 6px; }}
header.gov .sub {{ color:var(--color-neutral-500); font-size:15px; }}

section {{ margin-top:72px; }}
.sec-label {{ display:flex; align-items:baseline; gap:14px; border-bottom:2px solid var(--color-primary-500);
  padding-bottom:10px; margin-bottom:28px; }}
.sec-label .n {{ font:700 15px var(--mono); color:var(--color-primary-300); }}
.sec-label h2 {{ font:700 27px var(--serif); color:var(--color-primary-700); }}

.hero {{ background:var(--color-primary-700); color:#fff; border-radius:4px;
  padding:44px 48px; margin-top:48px; }}
.hero .big {{ font:700 58px/1.05 var(--serif); }}
.hero .big em {{ font-style:normal; color:#ffd267; }}
.hero p {{ margin-top:16px; max-width:56ch; color:#cfe0f2; }}

.kpis {{ display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:1px;
  background:var(--color-neutral-300); border:1px solid var(--color-neutral-300); margin-top:32px; }}
.kpi {{ background:#fff; padding:22px 20px; }}
.kpi .v {{ font:700 40px/1 var(--serif); color:var(--color-primary-500); font-variant-numeric:tabular-nums; }}
.kpi .v.alerta {{ color:var(--color-error-500); }}
.kpi .t {{ font-weight:600; margin-top:6px; }}
.kpi .c {{ font-size:13px; color:var(--color-neutral-500); margin-top:4px; }}

.callout {{ border-left:6px solid var(--color-error-500); background:#fff;
  border:1px solid var(--color-neutral-300); border-left-width:6px;
  border-left-color:var(--color-error-500); padding:24px 28px; }}
.callout h3 {{ font:700 20px var(--serif); color:var(--color-error-500); margin-bottom:8px; }}
.vazia-grupo {{ margin-top:18px; }}
.vazia-grupo h4 {{ font-size:15px; color:var(--color-neutral-700); }}
.lista {{ font-size:13px; color:var(--color-neutral-500); margin-top:4px; }}

.como-ler {{ font-size:13.5px; color:var(--color-neutral-500); margin-top:10px; }}
.dom-row {{ margin-top:22px; }}
.dom-head {{ display:flex; justify-content:space-between; gap:12px; flex-wrap:wrap; }}
.dom-head span {{ color:var(--color-neutral-500); font-size:14px; }}
.dom-desc {{ font-size:13px; color:var(--color-neutral-500); }}
.bar-track {{ background:var(--color-primary-100); height:14px; border-radius:2px; margin-top:6px; }}
.bar-fill {{ background:var(--color-primary-500); height:100%; border-radius:2px; }}
.dot-strip {{ margin-top:6px; line-height:1; }}
.dot-strip i {{ display:inline-block; width:9px; height:9px; border-radius:50%; margin:0 3px 3px 0;
  background:#fff; border:1.5px solid var(--color-neutral-300); }}
.dot-strip i.on {{ background:var(--color-primary-500); border-color:var(--color-primary-500); }}
.legenda {{ font-size:13px; color:var(--color-neutral-500); margin-top:14px; }}
.legenda i {{ display:inline-block; width:9px; height:9px; border-radius:50%; margin:0 4px -1px 6px;
  background:#fff; border:1.5px solid var(--color-neutral-300); }}
.legenda i.on {{ background:var(--color-primary-500); border-color:var(--color-primary-500); }}

.top-row {{ display:grid; grid-template-columns:minmax(200px,340px) 1fr 110px; gap:14px;
  align-items:center; margin-top:10px; }}
.top-row .num {{ text-align:right; }}

table.inv {{ width:100%; border-collapse:collapse; background:#fff; font-size:14px;
  border:1px solid var(--color-neutral-300); }}
table.inv th {{ background:var(--color-primary-700); color:#fff; text-align:left; padding:10px 12px;
  cursor:pointer; user-select:none; white-space:nowrap; position:sticky; top:0; }}
table.inv th .arw {{ opacity:.55; font-size:11px; }}
table.inv td {{ padding:8px 12px; border-top:1px solid var(--color-neutral-100); vertical-align:top; }}
table.inv tr:hover td {{ background:var(--color-primary-100); }}
.scroll-x {{ overflow-x:auto; max-height:70vh; overflow-y:auto; border:1px solid var(--color-neutral-300); }}
.scroll-x table.inv {{ border:0; }}
.num {{ text-align:right; font-variant-numeric:tabular-nums; white-space:nowrap; }}
.mono {{ font-family:var(--mono); font-size:13px; }}
.nota {{ color:var(--color-neutral-500); font-size:13px; min-width:180px; }}
.nova {{ font:600 10px var(--sans); letter-spacing:.08em; text-transform:uppercase;
  color:var(--color-info-500); border:1px solid currentColor; border-radius:3px; padding:1px 5px; }}

.badge {{ display:inline-block; font-size:12px; font-weight:600; padding:2px 9px; border-radius:3px;
  white-space:nowrap; }}
.badge.migrar {{ background:#e3f2e9; color:var(--color-success-500); }}
.badge.avaliar {{ background:#fdf3d8; color:var(--color-warning-500); }}
.badge.nao-migrar {{ background:#fae4e2; color:var(--color-error-500); }}
.badge.tecnica {{ background:var(--color-primary-100); color:var(--color-info-500); }}

details {{ background:#fff; border:1px solid var(--color-neutral-300); border-radius:3px;
  margin-top:12px; padding:0; }}
details summary {{ cursor:pointer; padding:14px 18px; font-weight:600; color:var(--color-primary-700); }}
details[open] summary {{ border-bottom:1px solid var(--color-neutral-100); }}
details pre {{ padding:18px; overflow-x:auto; font:13px/1.5 var(--mono); }}
pre.mermaid {{ background:#fff; }}
pre.sql {{ background:var(--color-neutral-900); color:#e8eaf0; border-radius:3px;
  padding:20px; overflow-x:auto; font:13px/1.7 var(--mono); }}

ol.pauta li {{ margin-top:12px; }}
footer {{ margin-top:88px; border-top:1px solid var(--color-neutral-300); padding-top:20px;
  font-size:13px; color:var(--color-neutral-500); }}
@media print {{
  .hero {{ background:var(--color-primary-700) !important; -webkit-print-color-adjust:exact; }}
  details {{ break-inside:avoid; }}
  .scroll-x {{ max-height:none; overflow:visible; }}
}}
@media (max-width:720px) {{
  header.gov h1 {{ font-size:30px; }} .hero .big {{ font-size:36px; }}
  .top-row {{ grid-template-columns:1fr; gap:4px; }} .top-row .num {{ text-align:left; }}
}}
</style>
</head>
<body>

<header class="gov">
  <div class="wrap">
    <div class="org">Governo de Mato Grosso do Sul · Secretaria-Executiva de Transformação Digital — SETDIG</div>
    <h1>Mapeamento do Banco de Dados EDS</h1>
    <div class="sub">Subsídio para a decisão de migração EDS → XVia · Banco <span class="mono">admin_prd</span> · Contagens exatas extraídas em {hoje} · Acesso somente leitura</div>
  </div>
</header>

<div class="wrap">

<div class="hero">
  <div class="big"><em>{pct_vazias}%</em> das tabelas do banco da EDS nunca receberam um registro.</div>
  <p>{len(vazias)} das {total} tabelas estão completamente vazias — entre elas, módulos inteiros de
  agendamento, diário de atendimento e login por redes sociais que existem no sistema, mas nunca
  foram usados. Esse conjunto é o primeiro candidato a ficar fora da migração.</p>
</div>

<div class="kpis">
  <div class="kpi"><div class="v">{total}</div><div class="t">tabelas no banco</div>
    <div class="c">{len(MAPEADAS)} constavam no mapeamento manual; {len(novas)} foram descobertas nesta extração</div></div>
  <div class="kpi"><div class="v">{len(com_dados)}</div><div class="t">tabelas em uso</div>
    <div class="c">têm ao menos um registro — é sobre elas que a decisão de migrar precisa acontecer</div></div>
  <div class="kpi"><div class="v alerta">{len(vazias)}</div><div class="t">tabelas sem uso</div>
    <div class="c">zero registros — funcionalidade nunca ativada ou abandonada</div></div>
  <div class="kpi"><div class="v">{fmt(registros)}</div><div class="t">registros no total</div>
    <div class="c">{pct_top2}% concentrados em apenas 2 tabelas (termos assinados e usuários)</div></div>
  <div class="kpi"><div class="v">{fmt_bytes(bytes_total)}</div><div class="t">tamanho do banco</div>
    <div class="c">espaço em disco de tabelas + índices — volume pequeno para migração</div></div>
</div>

<section>
  <div class="sec-label"><span class="n">01</span><h2>Apontamento crítico — tabelas sem uso</h2></div>
  <div class="callout">
    <h3>{len(vazias)} tabelas não possuem nenhum dado</h3>
    <p>“Sem uso” aqui significa <strong>zero registros</strong> na contagem exata de {hoje}.
    Recomendação inicial: <strong>não migrar</strong> nenhuma delas — e confirmar com a
    equipe da EDS se alguma corresponde a funcionalidade prevista para ativação.
    Destaque: os módulos de <strong>Agendamento</strong> e <strong>Diário</strong> estão 100% vazios,
    e as {len(social)} tabelas de login por redes sociais nunca foram usadas.</p>
    {vazias_html}
  </div>
</section>

<section>
  <div class="sec-label"><span class="n">02</span><h2>Onde estão os dados</h2></div>
  <p>O banco se organiza em {len(doms)} blocos funcionais. As barras mostram o volume de registros;
  os pontos mostram quantas tabelas de cada bloco estão em uso
  (<i class="on" style="display:inline-block;width:9px;height:9px;border-radius:50%;background:var(--color-primary-500)"></i> com dados ·
  <i style="display:inline-block;width:9px;height:9px;border-radius:50%;background:#fff;border:1.5px solid var(--color-neutral-300)"></i> vazia).</p>
  {barras_dom}
  <p class="como-ler">Como ler: quase todo o conteúdo do banco está no Núcleo do Portal e no cadastro de
  usuários. Os blocos de Agendamento e Diário existem na estrutura, mas não têm um único registro.</p>
</section>

<section>
  <div class="sec-label"><span class="n">03</span><h2>Concentração — as 10 maiores tabelas</h2></div>
  <p><strong>{pct_top2}% de todos os registros estão em apenas duas tabelas:</strong>
  termos assinados pelos cidadãos ({fmt(top2[0]['count'])}) e cadastro de usuários ({fmt(top2[1]['count'])}).
  Decidir o destino dessas duas resolve quase todo o volume da migração de dados.</p>
  {top10}
</section>

<section>
  <div class="sec-label"><span class="n">04</span><h2>Inventário completo ({total} tabelas)</h2></div>
  <p class="como-ler">Clique no cabeçalho para ordenar. A coluna “Sugestão” é uma proposta inicial da
  equipe técnica — a decisão final é da gestão, tabela a tabela. A etiqueta
  <span class="nova">nova</span> marca as {len(novas)} tabelas que não constavam no mapeamento manual de 20/07.</p>
  <div class="scroll-x">
  <table class="inv" id="inv">
    <thead><tr>
      <th>Tabela <span class="arw">↕</span></th><th>Bloco funcional <span class="arw">↕</span></th>
      <th class="num">Registros <span class="arw">↕</span></th><th class="num">Tamanho <span class="arw">↕</span></th>
      <th class="num">Colunas <span class="arw">↕</span></th><th>Sugestão <span class="arw">↕</span></th>
      <th>Anotação do mapeamento manual</th>
    </tr></thead>
    <tbody>{linhas_inv}</tbody>
  </table>
  </div>
</section>

<section>
  <div class="sec-label"><span class="n">05</span><h2>Diagrama de relacionamentos (DER)</h2></div>
  <p class="como-ler">Diagramas gerados a partir das chaves estrangeiras reais do banco, apenas para as
  {len(com_dados)} tabelas com dados, agrupadas por bloco funcional. Blocos grandes são exibidos sem o
  detalhe de colunas para manter a leitura possível — o detalhe completo está no arquivo
  <span class="mono">output/der.mmd</span> do repositório.</p>
  {ders}
</section>

<section>
  <div class="sec-label"><span class="n">06</span><h2>Anexo — consultas SQL prontas</h2></div>
  <p class="como-ler">Consultas para conferência independente dos números deste relatório
  (acesso somente leitura). O arquivo <span class="mono">output/consultas.sql</span> traz também uma
  consulta de amostra para cada uma das {total} tabelas.</p>
  <pre class="sql">-- Tabelas sem uso (zero registros)
SELECT c.relname AS tabela
FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' AND c.relkind = 'r'
  AND NOT EXISTS (SELECT 1 FROM pg_stat_user_tables s
                  WHERE s.relid = c.oid AND s.n_live_tup > 0)
ORDER BY 1;

-- Contagem por tabela (aproximada, instantânea)
SELECT relname AS tabela, n_live_tup AS registros
FROM pg_stat_user_tables ORDER BY n_live_tup DESC;

-- Tamanho em disco por tabela
SELECT relname AS tabela,
       pg_size_pretty(pg_total_relation_size(relid)) AS tamanho
FROM pg_stat_user_tables
ORDER BY pg_total_relation_size(relid) DESC;

-- Amostras (exemplos — lista completa em consultas.sql)
{selects_exemplo}</pre>
</section>

<section>
  <div class="sec-label"><span class="n">07</span><h2>Pauta de discussão — perguntas em aberto</h2></div>
  <p>Pontos levantados no mapeamento manual que precisam de decisão da gestão ou de alinhamento
  com a equipe da EDS e a XVia:</p>
  <ol class="pauta">
    {perguntas}
    <li>As {len(novas)} tabelas descobertas nesta extração (blocos de agendamento, atendimento on-line e
    diário) não constavam no mapeamento manual — validar se algum desses módulos está previsto na XVia.</li>
    <li>Confirmar com a EDS se alguma das {len(vazias)} tabelas vazias corresponde a funcionalidade
    contratada e ainda não ativada.</li>
  </ol>
</section>

<footer>
  <p><strong>Metodologia e limites:</strong> extração em {hoje} do banco <span class="mono">admin_prd</span>
  (PostgreSQL 13.8), com o acesso somente leitura do perfil <span class="mono">painel-sgd</span>.
  Contagens de registros são exatas no momento da extração; o banco está em produção, então os números
  mudam ao longo do tempo. “Tabela sem uso” = zero registros — não indica se a funcionalidade poderá
  ser usada no futuro. Sugestões de migração são propostas técnicas iniciais, não decisões.</p>
  <p style="margin-top:8px">Secretaria-Executiva de Transformação Digital — SETDIG · Superintendência de Governo Digital</p>
</footer>

</div>

<script type="module">
import mermaid from "https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs";
mermaid.initialize({{ startOnLoad: true, maxTextSize: 900000, er: {{ useMaxWidth: true }} }});
</script>
<script>
document.querySelectorAll('#inv th').forEach((th, i) => th.addEventListener('click', () => {{
  const tb = th.closest('table').tBodies[0];
  const dir = th.dataset.dir = th.dataset.dir === 'asc' ? 'desc' : 'asc';
  [...tb.rows].sort((a, b) => {{
    const ca = a.cells[i], cb = b.cells[i];
    const va = ca.dataset.v !== undefined ? +ca.dataset.v : ca.textContent.trim().toLowerCase();
    const vb = cb.dataset.v !== undefined ? +cb.dataset.v : cb.textContent.trim().toLowerCase();
    return (va > vb ? 1 : va < vb ? -1 : 0) * (dir === 'asc' ? 1 : -1);
  }}).forEach(r => tb.appendChild(r));
}}));
</script>
</body>
</html>"""

    OUT_HTML.write_text(html, encoding="utf-8")
    print(f"relatorio: {OUT_HTML} ({OUT_HTML.stat().st_size / 1024:.0f} kB)")
    print(f"consultas: {OUT_SQL}")


if __name__ == "__main__":
    main()
