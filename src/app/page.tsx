import { GovHeader } from "@/components/relatorio/GovHeader";
import { DecisaoSection } from "@/components/relatorio/DecisaoSection";
import { DescobertaSection } from "@/components/relatorio/DescobertaSection";
import { BlocosSection } from "@/components/relatorio/BlocosSection";
import { ConcentracaoSection } from "@/components/relatorio/ConcentracaoSection";
import { DecisaoTabelaSection } from "@/components/relatorio/DecisaoTabelaSection";
import { PautaSection } from "@/components/relatorio/PautaSection";
import { RoadmapSection } from "@/components/relatorio/RoadmapSection";
import { getInventarioEds } from "@/lib/data";

export default function Home() {
  const inv = getInventarioEds();
  const extraidoEm = new Date(inv.extraidoEm).toLocaleDateString("pt-BR");

  return (
    <>
      <GovHeader atual="/" />
      <main className="max-w-5xl mx-auto px-6 py-8 grid gap-8">
        <DecisaoSection decisao={inv.decisao} total={inv.tabelas.length} />
        <DescobertaSection tabelas={inv.tabelas} />
        <BlocosSection resumo={inv.resumoDominios} dominios={inv.dominios} />
        <ConcentracaoSection pareto={inv.paretoTop10} />
        <DecisaoTabelaSection tabelas={inv.tabelas} />
        <PautaSection perguntas={inv.perguntasAbertas} />
        <RoadmapSection />

        <footer className="text-xs mt-8 pt-6" style={{ borderTop: "1px solid var(--ds-color-border)", color: "var(--ds-color-text-muted)" }}>
          <p>
            <strong>Metodologia e limites:</strong> extração em {extraidoEm} do banco <span className="font-mono">admin_prd</span> (PostgreSQL
            13.8), com acesso somente leitura do perfil <span className="font-mono">painel-sgd</span>. Contagens de registros são exatas no
            momento da extração; o banco está em produção, então os números mudam ao longo do tempo. Tabela &quot;sem uso&quot; = zero
            registros — não indica se a funcionalidade poderá ser usada no futuro. Sugestões de migração e risco são propostas técnicas
            iniciais, não decisões.
          </p>
          <p className="mt-2">Secretaria-Executiva de Transformação Digital — SETDIG · Superintendência de Governo Digital</p>
        </footer>
      </main>
    </>
  );
}
