import Link from "next/link";
import { DOMINIOS_DISPONIVEIS, getInventario } from "@/lib/data";

export default function Home() {
  const cards = DOMINIOS_DISPONIVEIS.map((d) => {
    const inv = getInventario(d.id);
    const registros = inv.tabelas.reduce((soma, t) => soma + t.count, 0);
    return { ...d, tabelas: inv.tabelas.length, registros };
  });

  return (
    <main className="min-h-full flex flex-col items-center justify-center px-6 py-16">
      <div className="w-full" style={{ maxWidth: 640 }}>
        <div className="flex flex-col items-center text-center mb-12">
          {/* eslint-disable-next-line @next/next/no-img-element -- SVG decorativo pequeno, sem ganho real de next/image */}
          <img src="/images/brasao-ms.svg" alt="Brasão do Estado de Mato Grosso do Sul" style={{ height: 56, width: "auto" }} />
          <div className="text-xs uppercase tracking-widest mt-4" style={{ color: "var(--ds-color-text-muted)" }}>
            Governo de Mato Grosso do Sul · SETDIG
          </div>
          <h1 className="heading-portal mt-2">Mapeamento de Bancos</h1>
          <p className="mt-2 text-sm" style={{ color: "var(--ds-color-text-muted)" }}>
            Escolha o banco pra ver o inventário
          </p>
        </div>

        <div className="grid gap-4">
          {cards.map((c) => (
            <Link
              key={c.id}
              href={`/${c.id}`}
              className="group flex items-center justify-between gap-6 px-6 py-5 transition-colors"
              style={{
                border: "1px solid var(--ds-color-border)",
                borderRadius: "var(--ds-radius-md)",
                background: "var(--ds-color-background)",
              }}
            >
              <div className="min-w-0">
                <div className="font-semibold text-lg" style={{ color: "var(--ds-color-primary-600)" }}>
                  {c.label}
                </div>
                <div className="text-sm mt-1" style={{ color: "var(--ds-color-text-secondary)" }}>
                  {c.descricao}
                </div>
                <div className="text-xs mt-2 font-mono" style={{ color: "var(--ds-color-text-muted)" }}>
                  {c.tabelas} tabelas · {c.registros.toLocaleString("pt-BR")} registros
                </div>
              </div>
              <span
                aria-hidden
                className="shrink-0 text-xl transition-transform group-hover:translate-x-1"
                style={{ color: "var(--ds-color-text-muted)" }}
              >
                →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
