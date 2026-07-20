"use client";

/** Paginação genérica — números com janela + reticências quando há muitas páginas. */
export function Pagination({ page, totalPages, onChange }: { page: number; totalPages: number; onChange: (page: number) => void }) {
  if (totalPages <= 1) return null;

  return (
    <nav className="flex items-center justify-center gap-1 flex-wrap" aria-label="Paginação">
      <BotaoPagina disabled={page === 1} onClick={() => onChange(page - 1)} ariaLabel="Página anterior">
        ‹
      </BotaoPagina>
      {paginasVisiveis(page, totalPages).map((p, i) =>
        p === "…" ? (
          <span key={`ellipsis-${i}`} className="px-2 text-sm" style={{ color: "var(--ds-color-text-muted)" }}>
            …
          </span>
        ) : (
          <BotaoPagina key={p} ativo={p === page} onClick={() => onChange(p)}>
            {p}
          </BotaoPagina>
        ),
      )}
      <BotaoPagina disabled={page === totalPages} onClick={() => onChange(page + 1)} ariaLabel="Próxima página">
        ›
      </BotaoPagina>
    </nav>
  );
}

function BotaoPagina({
  children,
  ativo,
  disabled,
  onClick,
  ariaLabel,
}: {
  children: React.ReactNode;
  ativo?: boolean;
  disabled?: boolean;
  onClick: () => void;
  ariaLabel?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className="text-sm min-w-8 h-8 px-2 rounded"
      style={{
        border: "1px solid var(--ds-color-border)",
        background: ativo ? "var(--ds-color-primary-600)" : "var(--ds-color-background)",
        color: ativo ? "#fff" : "var(--ds-color-text-primary)",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.4 : 1,
      }}
    >
      {children}
    </button>
  );
}

function paginasVisiveis(atual: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const paginas = new Set([1, total, atual, atual - 1, atual + 1]);
  const ordenadas = [...paginas].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const resultado: (number | "…")[] = [];
  ordenadas.forEach((p, i) => {
    if (i > 0 && p - (ordenadas[i - 1] as number) > 1) resultado.push("…");
    resultado.push(p);
  });
  return resultado;
}
