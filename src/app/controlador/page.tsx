import { GovHeader } from "@/components/relatorio/GovHeader";
import { DecisaoSection } from "@/components/relatorio/DecisaoSection";
import { DescobertaSection } from "@/components/relatorio/DescobertaSection";
import { BlocosSection } from "@/components/relatorio/BlocosSection";
import { ConcentracaoSection } from "@/components/relatorio/ConcentracaoSection";
import { DecisaoTabelaSection } from "@/components/relatorio/DecisaoTabelaSection";
import { PautaSection } from "@/components/relatorio/PautaSection";
import { getInventario } from "@/lib/data";

export const metadata = { title: "Resumo executivo — Mapeamento do Banco Controlador" };

export default function ControladorHome() {
  const inv = getInventario("controlador");
  const extraidoEm = new Date(inv.extraidoEm).toLocaleDateString("pt-BR");

  return (
    <>
      <GovHeader atual="/controlador" dominio="controlador" />
      <main className="max-w-5xl mx-auto px-6 py-8 grid gap-8">
        <section
          className="text-sm p-4"
          style={{ border: "1px solid var(--ds-color-border)", borderRadius: "var(--ds-radius-md)", background: "var(--ds-color-background-muted)", color: "var(--ds-color-text-secondary)" }}
        >
          <strong style={{ color: "var(--ds-color-text-primary)" }}>Primeira rodada, sem curadoria de negócio:</strong>{" "}
          os blocos abaixo foram agrupados automaticamente pelo prefixo do nome de cada tabela — ainda não existe um
          mapeamento manual do Controlador equivalente ao que a Glau fez para a EDS. Nomes de tabela, criticidade de
          domínio e anotações vão melhorar quando esse mapeamento existir.
        </section>

        <DecisaoSection decisao={inv.decisao} total={inv.tabelas.length} bancoFrase="no Controlador" />
        <DescobertaSection
          tabelas={inv.tabelas}
          bancoFrase="do Controlador"
          caption={`${inv.tabelas.filter((t) => t.count === 0).length} das ${inv.tabelas.length} tabelas estão completamente vazias na extração de ${extraidoEm}.`}
        />
        <BlocosSection resumo={inv.resumoDominios} dominios={inv.dominios} />
        <ConcentracaoSection pareto={inv.paretoTop10} />
        <DecisaoTabelaSection tabelas={inv.tabelas} bancoFrase="do Controlador" hrefInventario="/controlador/inventario" />
        <PautaSection
          perguntas={inv.perguntasAbertas}
          titulo="6. Perguntas em aberto"
          descricao="Pontos que vão surgir quando houver um mapeamento manual do Controlador, no mesmo padrão do mapeamento da EDS."
        />

        <footer className="text-xs mt-8 pt-6" style={{ borderTop: "1px solid var(--ds-color-border)", color: "var(--ds-color-text-muted)" }}>
          <p>
            <strong>Metodologia e limites:</strong> extração em {extraidoEm} do banco <span className="font-mono">controlador_prd</span> (PostgreSQL),
            com acesso somente leitura do perfil <span className="font-mono">painel-sgd</span>. Contagens de registros são exatas no
            momento da extração; o banco está em produção, então os números mudam ao longo do tempo. Domínios/blocos funcionais são
            auto-derivados pelo prefixo do nome da tabela — ainda não há curadoria de negócio. Sugestões de migração e risco são
            propostas técnicas iniciais, não decisões.
          </p>
          <p className="mt-2">Secretaria-Executiva de Transformação Digital — SETDIG · Superintendência de Governo Digital</p>
        </footer>
      </main>
    </>
  );
}
