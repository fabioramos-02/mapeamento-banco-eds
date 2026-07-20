import { GovHeader } from "@/components/relatorio/GovHeader";
import { InventarioTable } from "@/components/relatorio/InventarioTable";
import { getInventarioEds } from "@/lib/data";

export const metadata = { title: "Inventário completo — Mapeamento do Banco EDS" };

export default function InventarioPage() {
  const inv = getInventarioEds();

  return (
    <>
      <GovHeader atual="/inventario" />
      <main className="max-w-6xl mx-auto px-6 py-8">
        <h2 className="text-xl font-semibold mb-2" style={{ color: "var(--ds-color-text-primary)" }}>
          Inventário completo
        </h2>
        <p className="text-sm mb-6" style={{ color: "var(--ds-color-text-secondary)" }}>
          As {inv.tabelas.length} tabelas do banco, com filtro por bloco funcional e por sugestão. A coluna
          &quot;Sugestão&quot; é uma proposta inicial da equipe técnica — a decisão final é da gestão, tabela a tabela.
        </p>
        <InventarioTable tabelas={inv.tabelas} dominios={inv.dominios} />
      </main>
    </>
  );
}
