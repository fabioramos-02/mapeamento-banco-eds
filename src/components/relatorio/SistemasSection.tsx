import { DashboardSection } from "@/components/dashboard/DashboardSection";
import { StoryCard } from "@/components/dashboard/StoryCard";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { ParetoChart } from "@/components/charts/ParetoChart";
import type { GovbrResumo } from "@/lib/data";

/** Sistemas externos integrados via govBR — dimensão que só existe no Controlador,
 * sem equivalente no Admin/EDS. "Registrados" = cadastro OAuth2; "login"/"assinatura"
 * = uso real confirmado (oauth2_provider_grant / authentication_assinaturagovbr). */
export function SistemasSection({ govbr }: { govbr: GovbrResumo }) {
  const top1 = govbr.porLogin[0];
  const paretoLogin = govbr.porLogin.slice(0, 10).map((s) => ({
    table: s.sistema, nomeNegocio: s.sistema, registros: s.registros, acumuladoPct: s.acumuladoPct,
  }));

  return (
    <DashboardSection title="5. Sistemas via govBR">
      <StoryCard
        anchor={`${govbr.appsComLoginGovbr} de ${govbr.appsRegistrados} sistemas cadastrados já fizeram login real via govBR.`}
        caption={top1 ? `${top1.sistema} concentra ${top1.acumuladoPct}% dos logins govBR — dos ${govbr.appsRegistrados} sistemas com integração OAuth2 cadastrada, só ${govbr.appsComAssinaturaGovbr} têm assinatura govBR concluída (fluxo de assinatura digital).` : undefined}
        comoLer="Cadastrado = tem app OAuth2 registrado no Controlador. Login govBR = de fato completou o fluxo de autenticação (oauth2_provider_grant). Assinatura govBR = completou o fluxo de assinatura digital (authentication_assinaturagovbr)."
      >
        <div className="grid grid-cols-3 gap-3 mb-4">
          <MetricCard label="Sistemas cadastrados" value={govbr.appsRegistrados} sub="oauth2_provider_application" />
          <MetricCard label="Com login govBR" value={govbr.appsComLoginGovbr} sub="oauth2_provider_grant" tone="success" />
          <MetricCard label="Com assinatura govBR" value={govbr.appsComAssinaturaGovbr} sub="authentication_assinaturagovbr" />
        </div>
        <ParetoChart dados={paretoLogin} />
      </StoryCard>
    </DashboardSection>
  );
}
