import { GovHeader } from "@/components/relatorio/GovHeader";
import { InventarioTable } from "@/components/relatorio/InventarioTable";
import { getInventario } from "@/lib/data";

export const metadata = { title: "Inventário completo — Mapeamento do Banco Controlador" };

export default function ControladorInventarioPage() {
  const inv = getInventario("controlador");

  return (
    <>
      <GovHeader atual="/controlador/inventario" dominio="controlador" />
      <main className="max-w-6xl mx-auto px-6 py-8">
        <h2 className="heading-portal mb-2">Inventário completo</h2>
        <p className="text-sm mb-6" style={{ color: "var(--ds-color-text-secondary)" }}>
          As {inv.tabelas.length} tabelas do banco Controlador, com filtro por bloco funcional e por sugestão. Blocos
          são auto-derivados pelo prefixo do nome da tabela (sem curadoria manual ainda). A coluna &quot;Sugestão&quot;
          é uma proposta inicial da equipe técnica — a decisão final é da gestão, tabela a tabela.
        </p>
        <InventarioTable tabelas={inv.tabelas} dominios={inv.dominios} />
      </main>
    </>
  );
}
