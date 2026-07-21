import { DashboardSection } from "@/components/dashboard/DashboardSection";

export function PautaSection({
  perguntas,
  titulo = "6. O que depende da EDS",
  descricao = "Pontos levantados no mapeamento manual que precisam de decisão da gestão ou de alinhamento com a equipe da EDS e a XVia.",
}: {
  perguntas: string[];
  titulo?: string;
  descricao?: string;
}) {
  return (
    <DashboardSection title={titulo}>
      <p className="text-sm mb-4" style={{ color: "var(--ds-color-text-secondary)" }}>
        {descricao}
      </p>
      {perguntas.length > 0 ? (
        <ol className="space-y-3 text-sm list-decimal list-inside" style={{ color: "var(--ds-color-text-primary)" }}>
          {perguntas.map((p, i) => (
            <li key={i}>{p}</li>
          ))}
        </ol>
      ) : (
        <p className="text-sm italic" style={{ color: "var(--ds-color-text-muted)" }}>
          Nenhuma pergunta registrada ainda.
        </p>
      )}
    </DashboardSection>
  );
}
