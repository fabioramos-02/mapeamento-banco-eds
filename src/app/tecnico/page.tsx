import fs from "node:fs";
import path from "node:path";
import { GovHeader } from "@/components/relatorio/GovHeader";
import { DerViewer } from "@/components/relatorio/DerViewer";
import { getInventarioEds } from "@/lib/data";

export const metadata = { title: "Anexo técnico — Mapeamento do Banco EDS" };

export default function TecnicoPage() {
  const inv = getInventarioEds();
  const dominioLabels = Object.fromEntries(inv.dominios.map((d) => [d.id, d.label]));
  const sql = fs.readFileSync(path.join(process.cwd(), "public", "consultas.sql"), "utf-8");

  return (
    <>
      <GovHeader atual="/tecnico" />
      <main className="max-w-5xl mx-auto px-6 py-8 flex flex-col gap-8">
        <section>
          <h2 className="heading-portal mb-2">Diagrama de relacionamentos (DER)</h2>
          <p className="text-sm mb-4" style={{ color: "var(--ds-color-text-secondary)" }}>
            Gerado a partir das chaves estrangeiras reais do banco, só para as tabelas com dados, agrupado por bloco
            funcional. Clique para expandir cada domínio.
          </p>
          <DerViewer der={inv.der} dominioLabels={dominioLabels} />
        </section>

        <section>
          <div className="flex items-center justify-between mb-2 gap-4 flex-wrap">
            <h2 className="heading-portal">Consultas SQL</h2>
            <a href="/consultas.sql" download className="ds-button ds-button--outline ds-button--sm">
              Baixar consultas.sql
            </a>
          </div>
          <p className="text-sm mb-4" style={{ color: "var(--ds-color-text-secondary)" }}>
            Consultas para conferência independente dos números deste relatório (acesso somente leitura) — inclui uma
            consulta de amostra para cada tabela.
          </p>
          <pre
            className="text-xs overflow-x-auto p-4"
            style={{ background: "var(--ds-color-neutral-900)", color: "#e8eaf0", borderRadius: "var(--ds-radius-md)" }}
          >
            {sql}
          </pre>
        </section>
      </main>
    </>
  );
}
