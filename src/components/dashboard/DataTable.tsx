"use client";

import { useEffect, useState } from "react";
import { Pagination } from "@/components/dashboard/Pagination";

export type Coluna<T> = {
  key: string;
  label: string;
  align?: "left" | "center" | "right";
  sortable?: boolean;
  sortValue?: (row: T) => string | number;
  render: (row: T) => React.ReactNode;
};

export type RangeInfo = { page: number; totalPages: number; from: number; to: number; total: number };

/** Tabela genérica de apresentação — recebe linhas já filtradas do chamador,
 * cuida de ordenar (clique no cabeçalho) e paginar (pageSize, default 20).
 * Copiado de bi-setdig/src/components/dashboard/DataTable.tsx.
 * ponytail: setas ↑↓ em texto puro — sem material-icons por 2 glifos. */
export function DataTable<T>({
  columns,
  rows,
  rowKey,
  pageSize = 20,
  onRangeChange,
}: {
  columns: Coluna<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  pageSize?: number;
  onRangeChange?: (info: RangeInfo) => void;
}) {
  const [ordem, setOrdem] = useState<{ key: string; dir: "asc" | "desc" } | null>(null);
  const [page, setPage] = useState(1);

  // Reset de página durante o render (não em useEffect — padrão recomendado do React
  // pra "ajustar estado quando uma prop muda", evita o cascading-render de um efeito).
  // Funciona porque o chamador recalcula `rows` (useMemo) só quando o filtro muda.
  const [rowsAnterior, setRowsAnterior] = useState(rows);
  const [ordemAnterior, setOrdemAnterior] = useState(ordem);
  if (rows !== rowsAnterior || ordem !== ordemAnterior) {
    setRowsAnterior(rows);
    setOrdemAnterior(ordem);
    setPage(1);
  }

  const colunaOrdenada = ordem ? columns.find((c) => c.key === ordem.key) : undefined;
  const linhas =
    colunaOrdenada?.sortValue && ordem
      ? [...rows].sort((a, b) => {
          const va = colunaOrdenada.sortValue!(a);
          const vb = colunaOrdenada.sortValue!(b);
          const cmp = typeof va === "number" && typeof vb === "number" ? va - vb : String(va).localeCompare(String(vb));
          return ordem.dir === "asc" ? cmp : -cmp;
        })
      : rows;

  const totalPaginas = Math.max(1, Math.ceil(linhas.length / pageSize));
  const paginaAtual = Math.min(page, totalPaginas);
  const inicio = (paginaAtual - 1) * pageSize;
  const linhasPagina = linhas.slice(inicio, inicio + pageSize);

  useEffect(() => {
    onRangeChange?.({
      page: paginaAtual,
      totalPages: totalPaginas,
      from: linhas.length === 0 ? 0 : inicio + 1,
      to: Math.min(inicio + pageSize, linhas.length),
      total: linhas.length,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paginaAtual, totalPaginas, linhas.length]);

  const alternarOrdem = (col: Coluna<T>) => {
    if (!col.sortable) return;
    setOrdem((atual) =>
      atual?.key === col.key ? { key: col.key, dir: atual.dir === "asc" ? "desc" : "asc" } : { key: col.key, dir: "desc" },
    );
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-x-auto print:overflow-visible" style={{ border: "1px solid var(--ds-color-border)", borderRadius: "var(--ds-radius-md)" }}>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr style={{ background: "var(--ds-color-background-muted)" }}>
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => alternarOrdem(col)}
                  className={`py-3 px-3 text-xs font-semibold uppercase tracking-wide whitespace-nowrap ${col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : "text-left"} ${col.sortable ? "cursor-pointer select-none" : ""}`}
                  style={{ color: "var(--ds-color-text-secondary)" }}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.label}
                    {col.sortable && (
                      <span style={{ opacity: ordem?.key === col.key ? 1 : 0.35 }} aria-hidden>
                        {ordem?.key === col.key && ordem.dir === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {linhasPagina.map((row) => (
              <tr
                key={rowKey(row)}
                className="align-top transition-colors data-table-row"
                style={{ borderTop: "1px solid var(--ds-color-border)" }}
              >
                {columns.map((col) => (
                  <td key={col.key} className={`py-3 px-3 ${col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : ""}`}>
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination page={paginaAtual} totalPages={totalPaginas} onChange={setPage} />
    </div>
  );
}
