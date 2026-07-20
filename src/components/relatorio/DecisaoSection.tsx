import { DashboardSection } from "@/components/dashboard/DashboardSection";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { StoryCard } from "@/components/dashboard/StoryCard";
import type { Decisao } from "@/lib/data";

export function DecisaoSection({ decisao, total }: { decisao: Decisao; total: number }) {
  const pctMigrar = Math.round((100 * decisao.migrar) / total);
  return (
    <DashboardSection title="1. A decisão">
      <StoryCard
        anchor={`Migrar tudo? Não — só ${pctMigrar}% das tabelas precisam virar dado migrado de verdade.`}
        caption={`Dos ${total} conjuntos de dados que existem hoje na EDS, a maior parte pode ser descartada ou recriada do zero na XVia — não copiada.`}
        comoLer="Cada rótulo abaixo é uma recomendação inicial da equipe técnica. A decisão final, tabela a tabela, é da gestão — a seção 5 detalha as mais críticas e a página de inventário completo traz todas."
      >
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <MetricCard label="Descartar" value={decisao.descartar} sub="tabelas sem uso — 0 registros" tone="danger" />
          <MetricCard label="Avaliar" value={decisao.avaliar} sub="uso incerto, precisa de decisão" tone="warning" />
          <MetricCard label="Migrar" value={decisao.migrar} sub="dado de negócio ativo" tone="success" />
          <MetricCard label="Recriar" value={decisao.recriar} sub="credenciais e infra — não copiar" />
        </div>
      </StoryCard>
    </DashboardSection>
  );
}
