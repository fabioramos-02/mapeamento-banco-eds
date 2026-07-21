import { GovHeader } from "@/components/relatorio/GovHeader";
import { InventarioTable } from "@/components/relatorio/InventarioTable";
import { getInventarioAdmin } from "@/lib/data";

export const metadata = { title: "Inventário completo — Mapeamento do Banco Admin (EDS)" };

export default function AdminInventarioPage() {
  const inv = getInventarioAdmin();

  return (
    <>
      <GovHeader atual="/admin/inventario" dominio="admin" />
      <main className="max-w-6xl mx-auto px-6 py-8">
        <h2 className="heading-portal mb-2">Inventário completo</h2>
        <p className="text-sm mb-6" style={{ color: "var(--ds-color-text-secondary)" }}>
          As {inv.tabelas.length} tabelas do banco, com filtro por bloco funcional e por sugestão. A coluna
          &quot;Sugestão&quot; é uma proposta inicial da equipe técnica — a decisão final é da gestão, tabela a tabela.
        </p>
        <InventarioTable tabelas={inv.tabelas} dominios={inv.dominios} />
      </main>
    </>
  );
}
