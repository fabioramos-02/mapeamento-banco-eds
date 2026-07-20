"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Modal } from "@/components/dashboard/Modal";

// Carta de Serviço tem 34 tabelas sem FK entre a maioria delas — não é um DER
// estrito (entidade-relacionamento), é uma visão ampla das tabelas do domínio.
function tipoDiagrama(dominioId: string): "Modelagem Lógica" | "DER" {
  return dominioId === "carta-servico" ? "Modelagem Lógica" : "DER";
}

/** Lista de botões (um por domínio) que abrem o diagrama num modal grande —
 * Mermaid só é importado e renderizado quando o modal abre (lazy). */
export function DerViewer({ der, dominioLabels }: { der: Record<string, string>; dominioLabels: Record<string, string> }) {
  const [aberto, setAberto] = useState<string | null>(null);

  return (
    <div className="grid sm:grid-cols-2 gap-3">
      {Object.keys(der).map((dominioId) => (
        <button
          key={dominioId}
          type="button"
          onClick={() => setAberto(dominioId)}
          className="group text-left px-4 py-3 flex items-center justify-between gap-3 transition-colors"
          style={{ border: "1px solid var(--ds-color-border)", borderRadius: "var(--ds-radius-md)", background: "var(--ds-color-background)", cursor: "pointer" }}
        >
          <span className="min-w-0">
            <span className="font-semibold block" style={{ color: "var(--ds-color-primary-600)" }}>
              {dominioLabels[dominioId] ?? dominioId}
            </span>
            <span className="text-xs" style={{ color: "var(--ds-color-text-muted)" }}>
              Ver {tipoDiagrama(dominioId) === "Modelagem Lógica" ? "modelagem lógica" : "diagrama de relacionamentos (DER)"}
            </span>
          </span>
          <span
            aria-hidden
            className="shrink-0 transition-transform group-hover:translate-x-0.5"
            style={{ color: "var(--ds-color-text-muted)", fontSize: 18 }}
          >
            →
          </span>
        </button>
      ))}

      {aberto && (
        <DerModal
          dominioId={aberto}
          titulo={dominioLabels[aberto] ?? aberto}
          mermaidSrc={der[aberto]}
          onClose={() => setAberto(null)}
        />
      )}
    </div>
  );
}

const ZOOM_MIN = 0.2;
const ZOOM_MAX = 2.5;

function DerModal({ dominioId, titulo, mermaidSrc, onClose }: { dominioId: string; titulo: string; mermaidSrc: string; onClose: () => void }) {
  const [svg, setSvg] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const canvasRef = useRef<HTMLDivElement>(null);
  const arrastoRef = useRef<{ x: number; y: number; scrollLeft: number; scrollTop: number } | null>(null);
  const [arrastando, setArrastando] = useState(false);

  // Fit por conter (usa o menor entre largura/altura) — reage ao viewBox atual do
  // svg, que já deve estar cortado pro conteúdo real (ver efeito abaixo).
  const ajustarLargura = useCallback(() => {
    const canvas = canvasRef.current;
    const svgEl = canvas?.querySelector("svg");
    if (!canvas || !svgEl) return;
    const viewBox = svgEl.getAttribute("viewBox")?.split(/\s+/).map(Number);
    const larguraNativa = viewBox?.[2] || parseFloat(svgEl.getAttribute("width") || "0");
    const alturaNativa = viewBox?.[3] || parseFloat(svgEl.getAttribute("height") || "0");
    if (!larguraNativa || !alturaNativa) return;
    const disponivelW = canvas.clientWidth - 48;
    const disponivelH = canvas.clientHeight - 48;
    const escala = Math.min(disponivelW / larguraNativa, disponivelH / alturaNativa);
    setZoom(Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, escala)));
  }, []);

  // Corta o viewBox pro bbox real do conteúdo ANTES de guardar no state — fazer
  // isso num useEffect separado (rodando depois do commit) perde a corrida contra
  // o StrictMode do React, que invoca este effect assíncrono 2x em dev: a segunda
  // chamada de mermaid.render pode resolver depois do crop e substituir o SVG pelo
  // original (sem corte), fazendo o diagrama "encolher" dentro do viewBox cheio de
  // espaço morto. Cortando aqui, cada resolução da promise já produz uma string
  // final correta, então não importa qual delas "ganha".
  const recortarViewBox = useCallback((svgString: string) => {
    const container = document.createElement("div");
    container.style.cssText = "position:absolute;visibility:hidden;pointer-events:none;";
    document.body.appendChild(container);
    container.innerHTML = svgString;
    const svgEl = container.querySelector("svg");
    try {
      if (!svgEl) return svgString;
      const bbox = svgEl.getBBox();
      if (!bbox.width || !bbox.height) return svgString;
      const pad = 16;
      const largura = bbox.width + pad * 2;
      const altura = bbox.height + pad * 2;
      svgEl.setAttribute("viewBox", `${bbox.x - pad} ${bbox.y - pad} ${largura} ${altura}`);
      svgEl.setAttribute("width", String(largura));
      svgEl.setAttribute("height", String(altura));
      return container.innerHTML;
    } catch {
      return svgString;
    } finally {
      document.body.removeChild(container);
    }
  }, []);

  useEffect(() => {
    let cancelado = false;
    (async () => {
      try {
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({ startOnLoad: false, theme: "neutral" });
        const { svg: renderedSvg } = await mermaid.render(`der-${dominioId}`, mermaidSrc);
        if (!cancelado) setSvg(recortarViewBox(renderedSvg));
      } catch (err) {
        if (!cancelado) setErro(String(err));
      }
    })();
    return () => {
      cancelado = true;
    };
  }, [dominioId, mermaidSrc, recortarViewBox]);

  // Ajusta o zoom pro conteúdo já cortado assim que o SVG entra no DOM.
  useEffect(() => {
    if (!svg) return;
    ajustarLargura();
  }, [svg, ajustarLargura]);

  const onPointerDown = (e: React.PointerEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    arrastoRef.current = { x: e.clientX, y: e.clientY, scrollLeft: canvas.scrollLeft, scrollTop: canvas.scrollTop };
    setArrastando(true);
    canvas.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const inicio = arrastoRef.current;
    const canvas = canvasRef.current;
    if (!inicio || !canvas) return;
    canvas.scrollLeft = inicio.scrollLeft - (e.clientX - inicio.x);
    canvas.scrollTop = inicio.scrollTop - (e.clientY - inicio.y);
  };
  const pararArrasto = () => {
    arrastoRef.current = null;
    setArrastando(false);
  };

  return (
    <Modal open onClose={onClose} title={`${titulo} — ${tipoDiagrama(dominioId)}`} width="min(1400px, 96vw)" maxHeight="92vh" height="92vh">
      <div className="relative h-full min-h-[60vh] flex flex-col">
        <div
          className="absolute top-3 right-3 z-10 flex items-center gap-1 px-1.5 py-1.5"
          style={{
            border: "1px solid var(--ds-color-border)",
            borderRadius: "var(--ds-radius-huge, 999px)",
            background: "color-mix(in srgb, var(--ds-color-background) 88%, transparent)",
            backdropFilter: "blur(6px)",
            boxShadow: "0 4px 16px -4px rgba(0,0,0,0.18)",
          }}
        >
          <ToolbarBtn onClick={() => setZoom((z) => Math.max(ZOOM_MIN, z - 0.2))} label="Diminuir zoom">
            −
          </ToolbarBtn>
          <span className="text-xs font-medium w-11 text-center tabular-nums" style={{ color: "var(--ds-color-text-secondary)" }}>
            {Math.round(zoom * 100)}%
          </span>
          <ToolbarBtn onClick={() => setZoom((z) => Math.min(ZOOM_MAX, z + 0.2))} label="Aumentar zoom">
            +
          </ToolbarBtn>
          <span className="w-px h-5 mx-1" style={{ background: "var(--ds-color-border)" }} />
          <ToolbarBtn onClick={ajustarLargura} label="Ajustar ao conteúdo" wide>
            Ajustar
          </ToolbarBtn>
        </div>

        {erro && (
          <p className="p-4 text-sm" style={{ color: "var(--ds-color-red-600)" }}>
            Erro ao renderizar diagrama: {erro}
          </p>
        )}
        {!erro && !svg && (
          <div className="flex-1 flex items-center justify-center text-sm" style={{ color: "var(--ds-color-text-muted)" }}>
            Carregando diagrama…
          </div>
        )}
        {!erro && (
          <div
            ref={canvasRef}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={pararArrasto}
            onPointerLeave={pararArrasto}
            className="flex-1 min-h-0"
            style={{
              overflow: "auto",
              border: "1px solid var(--ds-color-border)",
              borderRadius: "var(--ds-radius-sm)",
              background: "var(--ds-color-background-muted)",
              backgroundImage: "radial-gradient(var(--ds-color-border) 1px, transparent 1px)",
              backgroundSize: "18px 18px",
              cursor: arrastando ? "grabbing" : "grab",
              visibility: svg ? "visible" : "hidden",
            }}
          >
            {svg && (
              <div
                style={{ transform: `scale(${zoom})`, transformOrigin: "top left", padding: 24, width: "fit-content", transition: arrastando ? "none" : "transform 120ms ease" }}
                dangerouslySetInnerHTML={{ __html: svg }}
              />
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}

function ToolbarBtn({ children, onClick, label, wide }: { children: React.ReactNode; onClick: () => void; label: string; wide?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex items-center justify-center font-medium transition-colors"
      style={{
        height: 30,
        minWidth: wide ? "auto" : 30,
        padding: wide ? "0 12px" : 0,
        borderRadius: "var(--ds-radius-huge, 999px)",
        border: "none",
        background: "transparent",
        color: "var(--ds-color-primary-600)",
        fontSize: wide ? 12 : 15,
        cursor: "pointer",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--ds-color-background-muted)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      {children}
    </button>
  );
}
