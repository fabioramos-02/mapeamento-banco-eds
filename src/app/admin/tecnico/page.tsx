import fs from "node:fs";
import path from "node:path";
import { GovHeader } from "@/components/relatorio/GovHeader";
import { DerViewer } from "@/components/relatorio/DerViewer";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { getInventarioAdmin } from "@/lib/data";

export const metadata = { title: "Anexo técnico — Mapeamento do Banco Admin (EDS)" };

// Consultas SQL vêm num único arquivo com blocos "-- N. Título" — quebra em
// seções pra render em accordion (<details>) em vez de despejar tudo de uma vez.
function secoesSql(sql: string) {
  const linhas = sql.split("\n");
  const secoes: { titulo: string; corpo: string }[] = [];
  let atual: { titulo: string; corpo: string[] } | null = null;
  for (const linha of linhas) {
    const header = linha.match(/^-- \d+\.\s*(.+)/);
    if (header) {
      if (atual) secoes.push({ titulo: atual.titulo, corpo: atual.corpo.join("\n").trim() });
      atual = { titulo: header[1], corpo: [] };
    } else if (atual) {
      atual.corpo.push(linha);
    }
  }
  if (atual) secoes.push({ titulo: atual.titulo, corpo: atual.corpo.join("\n").trim() });
  return secoes;
}

export default function AdminTecnicoPage() {
  const inv = getInventarioAdmin();
  const dominioLabels = Object.fromEntries(inv.dominios.map((d) => [d.id, d.label]));
  const sql = fs.readFileSync(path.join(process.cwd(), "public", "consultas-admin.sql"), "utf-8");
  const secoes = secoesSql(sql);

  const cartasServico = inv.tabelas.find((t) => t.table === "gerenciamento_servicos")?.count ?? 0;
  const orgaosCadastrados = inv.tabelas.find((t) => t.table === "gerenciamento_orgaos")?.count ?? 0;

  return (
    <>
      <GovHeader atual="/admin/tecnico" dominio="admin" />
      <main className="max-w-5xl mx-auto px-6 py-8 flex flex-col gap-8">
        <section className="grid sm:grid-cols-2 gap-3">
          <MetricCard label="Cartas de serviço cadastradas" value={cartasServico} sub="tabela gerenciamento_servicos" />
          <MetricCard label="Órgãos cadastrados" value={orgaosCadastrados} sub="tabela gerenciamento_orgaos" />
        </section>

        <section>
          <h2 className="heading-portal mb-2">Diagramas de dados</h2>
          <p className="text-sm mb-4" style={{ color: "var(--ds-color-text-secondary)" }}>
            Gerado a partir das chaves estrangeiras reais do banco, só para as tabelas com dados, agrupado por bloco
            funcional. <strong>Carta de Serviço</strong> é modelagem lógica — visão ampla das 34 tabelas do domínio,
            não um DER estrito, já que a maioria não tem chave estrangeira entre si. Os demais blocos são diagramas
            de relacionamento (DER) de verdade. Clique para expandir cada domínio.
          </p>
          <DerViewer der={inv.der} dominioLabels={dominioLabels} />
        </section>

        <section>
          <div className="flex items-center justify-between mb-2 gap-4 flex-wrap">
            <h2 className="heading-portal">Consultas SQL</h2>
            <a href="/consultas-admin.sql" download className="ds-button ds-button--outline ds-button--sm">
              Baixar consultas-admin.sql
            </a>
          </div>
          <p className="text-sm mb-4" style={{ color: "var(--ds-color-text-secondary)" }}>
            Consultas para conferência independente dos números deste relatório (acesso somente leitura) — inclui uma
            consulta de amostra para cada tabela.
          </p>
          <div className="flex flex-col gap-2">
            {secoes.map((secao) => (
              <details
                key={secao.titulo}
                className="group"
                style={{ border: "1px solid var(--ds-color-border)", borderRadius: "var(--ds-radius-md)" }}
              >
                <summary
                  className="cursor-pointer px-4 py-2.5 text-sm font-medium list-none flex items-center justify-between gap-3"
                  style={{ color: "var(--ds-color-primary-600)" }}
                >
                  {secao.titulo}
                  <span aria-hidden className="transition-transform group-open:rotate-180" style={{ color: "var(--ds-color-text-muted)" }}>
                    ▾
                  </span>
                </summary>
                <pre
                  className="text-xs overflow-x-auto p-4 m-0"
                  style={{ background: "var(--ds-color-neutral-900)", color: "#e8eaf0", borderTop: "1px solid var(--ds-color-border)" }}
                >
                  {secao.corpo}
                </pre>
              </details>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
