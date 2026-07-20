"use client";

import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ParetoItem } from "@/lib/data";

/** Barra de registros (eixo esquerdo) + linha de % acumulado (eixo direito) —
 * mesmo estilo de bi-setdig/src/components/charts/BarChart.tsx, com um
 * segundo eixo Y para o acumulado. */
export function ParetoChart({ dados, height = 320 }: { dados: ParetoItem[]; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={dados} margin={{ top: 8, right: 8, left: 0, bottom: 48 }}>
        <CartesianGrid stroke="var(--ds-color-border)" strokeDasharray="3 3" />
        <XAxis
          dataKey="nomeNegocio"
          tick={{ fill: "var(--ds-color-text-secondary)", fontSize: 11 }}
          angle={-30}
          textAnchor="end"
          interval={0}
          height={70}
        />
        <YAxis
          yAxisId="registros"
          tick={{ fill: "var(--ds-color-text-secondary)", fontSize: 12 }}
          tickFormatter={(v: number) => v.toLocaleString("pt-BR")}
        />
        <YAxis
          yAxisId="acumulado"
          orientation="right"
          domain={[0, 100]}
          tick={{ fill: "var(--ds-color-text-secondary)", fontSize: 12 }}
          tickFormatter={(v: number) => `${v}%`}
        />
        <Tooltip
          contentStyle={{
            background: "var(--ds-color-background)",
            border: "1px solid var(--ds-color-border)",
            color: "var(--ds-color-text-primary)",
          }}
          formatter={(value, name) =>
            name === "acumuladoPct"
              ? [`${value}%`, "Acumulado"]
              : [Number(value).toLocaleString("pt-BR"), "Registros"]
          }
        />
        <ReferenceLine yAxisId="acumulado" y={90} stroke="var(--ds-color-text-muted)" strokeDasharray="4 4" />
        <Bar yAxisId="registros" dataKey="registros" fill="var(--ds-color-primary-600)" radius={[4, 4, 0, 0]} />
        <Line
          yAxisId="acumulado"
          type="monotone"
          dataKey="acumuladoPct"
          stroke="var(--ds-color-secondary-600)"
          strokeWidth={2}
          dot={{ r: 3 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
