"use client";

import { ResponsiveContainer, Treemap } from "recharts";
import { corCategorica } from "@/lib/categorical-palette";
import type { ResumoDominio } from "@/lib/data";

type NoTreemap = { name: string; size: number; registros: number; vazias: number; total: number };

function ConteudoCelula(props: {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  name?: string;
  registros?: number;
  index?: number;
}) {
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

/** Um retângulo por bloco funcional, área proporcional ao volume de registros. */
export function DomainTreemap({ dados, height = 320 }: { dados: ResumoDominio[]; height?: number }) {
  const nos: NoTreemap[] = dados
    .filter((d) => d.registros > 0)
    .map((d) => ({ name: d.label, size: d.registros, registros: d.registros, vazias: d.vazias, total: d.total }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <Treemap data={nos} dataKey="size" stroke="var(--ds-color-background)" content={<ConteudoCelula />} />
    </ResponsiveContainer>
  );
}
