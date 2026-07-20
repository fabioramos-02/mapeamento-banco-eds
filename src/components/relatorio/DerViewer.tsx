"use client";

import { useState } from "react";

/** Um <details> por domínio — Mermaid só é importado e renderizado quando o
 * painel abre pela primeira vez (lazy), evita carregar 7 diagramas de uma vez. */
export function DerViewer({ der, dominioLabels }: { der: Record<string, string>; dominioLabels: Record<string, string> }) {
  return (
    <div className="flex flex-col gap-3">
      {Object.entries(der).map(([dominioId, mermaidSrc]) => (
        <DerPainel key={dominioId} id={dominioId} titulo={dominioLabels[dominioId] ?? dominioId} mermaidSrc={mermaidSrc} />
      ))}
    </div>
  );
}

function DerPainel({ id, titulo, mermaidSrc }: { id: string; titulo: string; mermaidSrc: string }) {
  const [svg, setSvg] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  async function handleToggle(e: React.SyntheticEvent<HTMLDetailsElement>) {
    if (!e.currentTarget.open || svg || carregando) return;
    setCarregando(true);
    try {
      const mermaid = (await import("mermaid")).default;
      mermaid.initialize({ startOnLoad: false, theme: "neutral" });
      const { svg: renderedSvg } = await mermaid.render(`der-${id}`, mermaidSrc);
      setSvg(renderedSvg);
    } catch (err) {
      setErro(String(err));
    } finally {
      setCarregando(false);
    }
  }

  return (
    <details onToggle={handleToggle} style={{ border: "1px solid var(--ds-color-border)", borderRadius: "var(--ds-radius-md)" }}>
      <summary className="cursor-pointer px-4 py-3 font-semibold" style={{ color: "var(--ds-color-primary-600)" }}>
        {titulo}
      </summary>
      <div className="p-4 overflow-x-auto">
        {erro && (
          <p className="text-sm" style={{ color: "var(--ds-color-red-600)" }}>
            Erro ao renderizar diagrama: {erro}
          </p>
        )}
        {!erro && svg && <div dangerouslySetInnerHTML={{ __html: svg }} />}
        {!erro && !svg && carregando && (
          <p className="text-sm" style={{ color: "var(--ds-color-text-muted)" }}>
            Carregando diagrama…
          </p>
        )}
      </div>
    </details>
  );
}
