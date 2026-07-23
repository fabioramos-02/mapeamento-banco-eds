"use client";

import Link from "next/link";
import { DashboardSection } from "@/components/dashboard/DashboardSection";
import { DataTable, type Coluna } from "@/components/dashboard/DataTable";
import { RiscoBadge, SugestaoBadge } from "@/components/relatorio/Badges";
import type { Tabela } from "@/lib/data";

const colunas: Coluna<Tabela>[] = [
  {
    key: "nome",
    label: "Conjunto de dados",
    sortable: true,
    sortValue: (t) => t.nomeNegocio,
    render: (t) => (
      <div>
        <div style={{ color: "var(--ds-color-text-primary)" }} className="font-medium">
          {t.nomeNegocio}
        </div>
        <div className="font-mono text-xs" style={{ color: "var(--ds-color-text-muted)" }}>
          {t.table}
        </div>
      </div>
    ),
  },
  { key: "dominio", label: "Bloco", sortable: true, sortValue: (t) => t.dominioLabel, render: (t) => t.dominioLabel },
  {
    key: "registros",
    label: "Registros",
    align: "right",
    sortable: true,
    sortValue: (t) => t.count,
    render: (t) => t.count.toLocaleString("pt-BR"),
  },
  { key: "risco", label: "Risco", render: (t) => <RiscoBadge risco={t.risco} /> },
  { key: "sugestao", label: "Sugestão", render: (t) => <SugestaoBadge classe={t.sugestaoClasse} rotulo={t.sugestaoRotulo} /> },
];

/** Só as tabelas críticas (risco alto) — o inventário completo fica em /inventario. */
export function DecisaoTabelaSection({
  tabelas,
  bancoFrase = "da EDS",
  hrefInventario = "/inventario",
  titulo = "5. O que migrar primeiro",
}: {
  tabelas: Tabela[];
  bancoFrase?: string;
  hrefInventario?: string;
  titulo?: string;
}) {
  const criticas = tabelas.filter((t) => t.risco === "alto").sort((a, b) => b.count - a.count);

  return (
    <DashboardSection
      title={titulo}
      action={
        <Link href={hrefInventario} className="ds-button ds-button--outline ds-button--sm">
          Ver inventário completo →
        </Link>
      }
    >
      <p className="text-sm mb-4" style={{ color: "var(--ds-color-text-secondary)" }}>
        {criticas.length} tabelas concentram o maior risco de migração — volume alto num bloco central do negócio.
        Merecem validação prioritária com a equipe {bancoFrase} antes de qualquer decisão.
      </p>
      <DataTable columns={colunas} rows={criticas} rowKey={(t) => t.table} />
    </DashboardSection>
  );
}
