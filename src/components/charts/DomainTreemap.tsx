"use client";

import { ResponsiveContainer, Tooltip, Treemap } from "recharts";
import { corCategorica } from "@/lib/categorical-palette";
import type { ResumoDominio } from "@/lib/data";

const LIMIAR_OUTROS = 0.05; // domínios abaixo de 5% do total viram um bloco "Outros" — evita fatia sem texto

type NoTreemap = { name: string; size: number; registros: number; detalhe?: string };

function agruparPequenos(dados: ResumoDominio[]): NoTreemap[] {
  const ativos = dados.filter((d) => d.registros > 0);
  const total = ativos.reduce((s, d) => s + d.registros, 0) || 1;

  const grandes = ativos.filter((d) => d.registros / total >= LIMIAR_OUTROS);
  const pequenos = ativos.filter((d) => d.registros / total < LIMIAR_OUTROS);

  const nos: NoTreemap[] = grandes
    .sort((a, b) => b.registros - a.registros)
    .map((d) => ({ name: d.label, size: d.registros, registros: d.registros }));

  if (pequenos.length > 0) {
    const registrosOutros = pequenos.reduce((s, d) => s + d.registros, 0);
    nos.push({
      name: "Outros",
      size: registrosOutros,
      registros: registrosOutros,
      detalhe: pequenos.map((d) => `${d.label}: ${d.registros.toLocaleString("pt-BR")}`).join(" · "),
    });
  }

  return nos;
}

function ConteudoCelula(props: { x?: number; y?: number; width?: number; height?: number; name?: string; registros?: number; index?: number }) {
  const { x = 0, y = 0, width = 0, height = 0, name = "", registros = 0, index = 0 } = props;
  const cabe = width > 70 && height > 36;
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} fill={corCategorica(index)} stroke="var(--ds-color-background)" strokeWidth={2} />
      {cabe && (
        <text x={x + 8} y={y + 20} fill="#fff" fontSize={13} fontWeight={600}>
          {name}
        </text>
      )}
      {cabe && height > 52 && (
        <text x={x + 8} y={y + 38} fill="#fff" fontSize={12} opacity={0.9}>
          {registros.toLocaleString("pt-BR")} registros
        </text>
      )}
    </g>
  );
}

function TreemapTooltip({ active, payload }: { active?: boolean; payload?: { payload: NoTreemap }[] }) {
  if (!active || !payload?.length) return null;
  const no = payload[0].payload;
  return (
    <div
      style={{
        background: "var(--ds-color-background)",
        border: "1px solid var(--ds-color-border)",
        color: "var(--ds-color-text-primary)",
        borderRadius: "var(--ds-radius-sm)",
        padding: "8px 12px",
        maxWidth: 280,
      }}
      className="text-sm"
    >
      <div className="font-semibold">{no.name}</div>
      <div style={{ color: "var(--ds-color-text-secondary)" }}>{no.registros.toLocaleString("pt-BR")} registros</div>
      {no.detalhe && (
        <div className="text-xs mt-1" style={{ color: "var(--ds-color-text-muted)" }}>
          {no.detalhe}
        </div>
      )}
    </div>
  );
}

/** Um retângulo por bloco funcional (ou "Outros" agrupando os pequenos), área
 * proporcional ao volume de registros. Domínios abaixo de 5% do total viram
 * um único bloco "Outros" — sem isso, fatias minúsculas ficam sem texto legível. */
export function DomainTreemap({ dados, height = 320 }: { dados: ResumoDominio[]; height?: number }) {
  const nos = agruparPequenos(dados);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <Treemap data={nos} dataKey="size" stroke="var(--ds-color-background)" content={<ConteudoCelula />}>
        <Tooltip content={<TreemapTooltip />} />
      </Treemap>
    </ResponsiveContainer>
  );
}
