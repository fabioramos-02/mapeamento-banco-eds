import Link from "next/link";
import { DOMINIOS_DISPONIVEIS, getInventario } from "@/lib/data";

export default function Home() {
  const cards = DOMINIOS_DISPONIVEIS.map((d) => {
    const inv = getInventario(d.id);
    const registros = inv.tabelas.reduce((soma, t) => soma + t.count, 0);
    return { ...d, tabelas: inv.tabelas.length, registros };
  });

  return (
    <main className="min-h-full flex flex-col items-center px-6 py-16">
      <div className="w-full" style={{ maxWidth: 960 }}>
        <div className="flex flex-col items-center text-center mb-10">
          {/* eslint-disable-next-line @next/next/no-img-element -- SVG decorativo pequeno, sem ganho real de next/image */}
          <img src="/images/brasao-ms.svg" alt="Brasão do Estado de Mato Grosso do Sul" style={{ height: 56, width: "auto" }} />
          <div className="text-xs uppercase tracking-widest mt-4" style={{ color: "var(--ds-color-text-muted)" }}>
            Governo de Mato Grosso do Sul · SETDIG
          </div>
          <h1 className="heading-portal mt-2">Mapeamento de Bancos</h1>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <span aria-hidden style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--ds-color-success)" }} />
          <h2 className="font-bold text-lg" style={{ color: "var(--ds-color-text-primary)" }}>
            Bancos em destaque
          </h2>
        </div>

        <div className="flex flex-wrap gap-4">
          {cards.map((c) => (
            <Link
              key={c.id}
              href={`/${c.id}`}
              className="ds-card transition-transform hover:-translate-y-0.5"
              style={{ maxWidth: 460, flex: "1 1 380px", borderLeft: "4px solid var(--ds-color-success)" }}
            >
              <div className="ds-card__content">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="ds-card__title">{c.label}</h3>
                  <span aria-hidden className="shrink-0" style={{ color: "var(--ds-color-text-primary)", fontSize: 14 }}>
                    ↗
                  </span>
                </div>
                <p className="ds-card__description">{c.descricao}</p>
                <div className="text-xs font-mono" style={{ color: "var(--ds-color-text-muted)" }}>
                  {c.tabelas} tabelas · {c.registros.toLocaleString("pt-BR")} registros
                </div>
                <div className="ds-card__actions">
                  <span className="ds-card__link">Acessar relatório</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
