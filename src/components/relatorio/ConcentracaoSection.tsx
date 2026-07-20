import { DashboardSection } from "@/components/dashboard/DashboardSection";
import { StoryCard } from "@/components/dashboard/StoryCard";
import { ParetoChart } from "@/components/charts/ParetoChart";
import type { ParetoItem } from "@/lib/data";

export function ConcentracaoSection({ pareto }: { pareto: ParetoItem[] }) {
  const top2Pct = pareto[1]?.acumuladoPct ?? pareto[0]?.acumuladoPct ?? 0;
  const [t1, t2] = pareto;

  return (
    <DashboardSection title="4. Concentração">
      <StoryCard
        anchor={`${top2Pct}% de todos os registros do banco estão em apenas duas tabelas.`}
        caption={t1 && t2 ? `${t1.nomeNegocio} e ${t2.nomeNegocio} concentram quase todo o volume — decidir o destino dessas duas resolve a maior parte da migração de dados.` : undefined}
        comoLer="A barra é o volume de registros de cada tabela; a linha é o percentual acumulado. A linha tracejada marca 90% do total."
      >
        <ParetoChart dados={pareto} />
      </StoryCard>
    </DashboardSection>
  );
}
