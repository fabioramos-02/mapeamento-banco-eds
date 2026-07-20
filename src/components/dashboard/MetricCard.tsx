// Copiado de bi-setdig/src/components/dashboard/MetricCard.tsx
// ponytail: prop `icon` removida — sem lucide-react (nenhum ícone usado neste app).
export function MetricCard({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: string | number;
  sub?: string;
  tone?: "success" | "danger" | "warning";
}) {
  const cor = tone
    ? `var(--ds-color-${tone === "success" ? "green" : tone === "danger" ? "red" : "yellow"}-600)`
    : "var(--ds-color-primary-600)";
  return (
    <div
      style={{
        border: "1px solid var(--ds-color-border)",
        borderRadius: "var(--ds-radius-md)",
        padding: "var(--ds-spacing-20)",
        background: "var(--ds-color-background)",
      }}
    >
      <div style={{ color: "var(--ds-color-text-secondary)" }} className="text-sm mb-1">
        {label}
      </div>
      <div style={{ color: cor }} className="text-3xl font-semibold">
        {typeof value === "number" ? value.toLocaleString("pt-BR") : value}
      </div>
      {sub && (
        <div style={{ color: "var(--ds-color-text-muted)" }} className="text-xs mt-1">
          {sub}
        </div>
      )}
    </div>
  );
}
