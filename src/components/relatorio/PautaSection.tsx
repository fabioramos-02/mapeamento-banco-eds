import { DashboardSection } from "@/components/dashboard/DashboardSection";

export function PautaSection({ perguntas }: { perguntas: string[] }) {
  return (
    <DashboardSection title="6. O que depende da EDS">
      <p className="text-sm mb-4" style={{ color: "var(--ds-color-text-secondary)" }}>
        Pontos levantados no mapeamento manual que precisam de decisão da gestão ou de alinhamento com a equipe da
        EDS e a XVia.
      </p>
      <ol className="space-y-3 text-sm list-decimal list-inside" style={{ color: "var(--ds-color-text-primary)" }}>
        {perguntas.map((p, i) => (
          <li key={i}>{p}</li>
        ))}
      </ol>
    </DashboardSection>
  );
}
