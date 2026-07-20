import { DashboardSection } from "@/components/dashboard/DashboardSection";

const ETAPAS = [
  { titulo: "Excluir as tabelas sem uso", desc: "55 tabelas com zero registros — confirmar com a EDS que nenhuma corresponde a funcionalidade contratada e ainda não ativada, e retirá-las do escopo de migração." },
  { titulo: "Validar as tabelas críticas", desc: "Tabelas de risco alto (seção 5) — volume grande num bloco central do negócio. Confirmar regras de negócio e formato esperado na XVia antes de migrar." },
  { titulo: "Migrar a Carta de Serviço", desc: "Serviços, órgãos, unidades, temas e o cadastro de usuários — a base que sustenta a carta de serviços." },
  { titulo: "Recriar credenciais e infraestrutura", desc: "Tokens de acesso, chaves de API e tabelas internas do framework não são copiados — nascem de novo na XVia." },
  { titulo: "Homologação", desc: "Conferir volume, integridade e regras de negócio dos dados migrados antes de desligar o acesso à EDS." },
];

export function RoadmapSection() {
  return (
    <DashboardSection title="7. Plano de ação">
      <ol className="space-y-4">
        {ETAPAS.map((e, i) => (
          <li key={e.titulo} className="flex gap-4">
            <div
              className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
              style={{ background: "var(--ds-color-primary-600)", color: "#fff" }}
            >
              {i + 1}
            </div>
            <div>
              <div className="font-semibold" style={{ color: "var(--ds-color-text-primary)" }}>
                {e.titulo}
              </div>
              <div className="text-sm mt-0.5" style={{ color: "var(--ds-color-text-secondary)" }}>
                {e.desc}
              </div>
            </div>
          </li>
        ))}
      </ol>
    </DashboardSection>
  );
}
