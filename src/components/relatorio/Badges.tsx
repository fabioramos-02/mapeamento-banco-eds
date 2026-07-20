import type { Risco, SugestaoClasse } from "@/lib/data";

export const RISCO_INFO: Record<Risco, { emoji: string; label: string; cor: string }> = {
  alto: { emoji: "🔴", label: "Risco alto", cor: "var(--ds-color-red-600)" },
  medio: { emoji: "🟡", label: "Risco médio", cor: "var(--ds-color-yellow-600)" },
  baixo: { emoji: "🟢", label: "Risco baixo", cor: "var(--ds-color-green-600)" },
};

const SUGESTAO_COR: Record<SugestaoClasse, string> = {
  "nao-migrar": "var(--ds-color-red-600)",
  avaliar: "var(--ds-color-yellow-600)",
  migrar: "var(--ds-color-green-600)",
  tecnica: "var(--ds-color-blue-600)",
};

export function RiscoBadge({ risco }: { risco: Risco }) {
  const info = RISCO_INFO[risco];
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold whitespace-nowrap" style={{ color: info.cor }}>
      {info.emoji} {info.label}
    </span>
  );
}

export function SugestaoBadge({ classe, rotulo }: { classe: SugestaoClasse; rotulo: string }) {
  return (
    <span
      className="inline-block text-xs font-semibold px-2 py-0.5 rounded whitespace-nowrap"
      style={{ color: SUGESTAO_COR[classe], background: "var(--ds-color-background-muted)" }}
    >
      {rotulo}
    </span>
  );
}
