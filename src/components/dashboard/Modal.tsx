"use client";

import { useEffect, useRef } from "react";

/** Wrapper fino sobre <dialog> nativo — showModal()/close() dão backdrop, ESC
 * pra fechar e foco preso de graça, sem precisar de biblioteca.
 * Copiado de bi-setdig/src/components/dashboard/Modal.tsx.
 * ponytail: botão fechar em "×" texto puro — sem material-icons por 1 glifo. */
export function Modal({
  open,
  onClose,
  title,
  width = "min(560px, 92vw)",
  maxHeight = "85vh",
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  width?: string;
  maxHeight?: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    else if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      className="backdrop:bg-black/60 backdrop:backdrop-blur-sm p-0 print:hidden"
      style={{
        border: "1px solid var(--ds-color-border)",
        borderRadius: "var(--ds-radius-md)",
        background: "var(--ds-color-background)",
        color: "var(--ds-color-text-primary)",
        boxShadow: "0 24px 64px -12px rgba(0,0,0,0.35)",
        width,
        maxHeight,
        display: "flex",
        flexDirection: "column",
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        margin: 0,
      }}
    >
      <div className="flex items-start justify-between gap-3 px-5 py-4 shrink-0" style={{ borderBottom: "1px solid var(--ds-color-border)" }}>
        <h2 className="heading-portal">{title}</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar"
          className="shrink-0"
          style={{ color: "var(--ds-color-text-muted)", fontSize: 24, lineHeight: 1, background: "none", border: "none", cursor: "pointer" }}
        >
          ×
        </button>
      </div>
      <div className="p-5 overflow-y-auto min-h-0 flex-1">{children}</div>
    </dialog>
  );
}
