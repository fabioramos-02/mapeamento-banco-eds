import Link from "next/link";

const LINKS = [
  { href: "/", label: "Resumo executivo" },
  { href: "/inventario", label: "Inventário completo" },
  { href: "/tecnico", label: "Anexo técnico" },
] as const;

export function GovHeader({ atual = "/" }: { atual?: string }) {
  return (
    <header
      style={{
        borderTop: "6px solid var(--ds-color-primary-600)",
        borderBottom: "1px solid var(--ds-color-border)",
        background: "var(--ds-color-background)",
      }}
    >
      <div className="max-w-5xl mx-auto px-6 py-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-widest" style={{ color: "var(--ds-color-text-muted)" }}>
            Governo de Mato Grosso do Sul · Secretaria-Executiva de Transformação Digital — SETDIG
          </div>
          <h1
            className="mt-2 text-3xl font-bold"
            style={{ color: "var(--ds-color-primary-600)", fontFamily: "var(--ds-font-family-heading)" }}
          >
            Mapeamento do Banco EDS
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--ds-color-text-muted)" }}>
            Subsídio para a decisão de migração de dados na transição EDS → XVia
          </p>
        </div>
        <nav className="flex gap-4 text-sm font-medium">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              style={{ color: atual === l.href ? "var(--ds-color-primary-600)" : "var(--ds-color-text-secondary)" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
