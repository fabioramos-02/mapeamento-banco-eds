import { DashboardSection } from "@/components/dashboard/DashboardSection";
import { DomainTreemap } from "@/components/charts/DomainTreemap";
import type { Dominio, ResumoDominio } from "@/lib/data";

export function BlocosSection({ resumo, dominios }: { resumo: ResumoDominio[]; dominios: Dominio[] }) {
  const porId = new Map(dominios.map((d) => [d.id, d]));
  const ordenado = [...resumo].filter((r) => r.registros > 0).sort((a, b) => b.registros - a.registros);

  return (
    <DashboardSection title="3. Onde estão os dados">
      <p className="text-sm mb-4" style={{ color: "var(--ds-color-text-secondary)" }}>
        O banco se organiza em blocos funcionais. O tamanho de cada retângulo é proporcional ao volume de registros.
      </p>
      <DomainTreemap dados={resumo} />
      <ul className="mt-4 grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
        {ordenado.map((r) => (
          <li key={r.dominioId}>
            <strong style={{ color: "var(--ds-color-text-primary)" }}>{r.label}</strong>
            <span style={{ color: "var(--ds-color-text-muted)" }}>
              {" "}
              — {porId.get(r.dominioId)?.descricao} ({r.total - r.vazias} de {r.total} tabelas em uso)
            </span>
          </li>
        ))}
      </ul>
    </DashboardSection>
  );
}
