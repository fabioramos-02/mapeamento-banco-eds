import { DashboardSection } from "@/components/dashboard/DashboardSection";
import { StoryCard } from "@/components/dashboard/StoryCard";
import { CategoryDonut } from "@/components/charts/CategoryDonut";
import type { Tabela } from "@/lib/data";

export function DescobertaSection({
  tabelas,
  bancoFrase = "da EDS",
  caption,
}: {
  tabelas: Tabela[];
  bancoFrase?: string;
  caption?: string;
}) {
  const total = tabelas.length;
  const vazias = tabelas.filter((t) => t.count === 0).length;
  const comDados = total - vazias;
  const pctVazias = Math.round((100 * vazias) / total);

  return (
    <DashboardSection title="2. A descoberta">
      <StoryCard
        anchor={`${pctVazias}% das tabelas do banco ${bancoFrase} nunca receberam um registro.`}
        caption={caption ?? `${vazias} das ${total} tabelas estão completamente vazias — módulos inteiros de agendamento, diário de atendimento e login por redes sociais existem na estrutura do banco, mas nunca foram usados.`}
        comoLer="Sem uso aqui significa zero registros na contagem exata da extração — não indica se a funcionalidade poderá ser usada no futuro."
      >
        <CategoryDonut
          dados={[
            { categoria: "Com dados", valor: comDados, participacaoPct: (100 * comDados) / total },
            { categoria: "Sem uso", valor: vazias, participacaoPct: (100 * vazias) / total },
          ]}
        />
      </StoryCard>
    </DashboardSection>
  );
}
