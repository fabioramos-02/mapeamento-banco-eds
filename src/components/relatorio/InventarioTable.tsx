"use client";

import { useMemo, useState } from "react";
import { DataTable, type Coluna, type RangeInfo } from "@/components/dashboard/DataTable";
import { Select } from "@/components/dashboard/Select";
import { RiscoBadge, SugestaoBadge } from "@/components/relatorio/Badges";
import { formatBytes } from "@/lib/format";
import type { Dominio, Tabela } from "@/lib/data";

const STATUS_OPCOES = [
  { value: "migrar", label: "Migrar" },
  { value: "avaliar", label: "Avaliar" },
  { value: "nao-migrar", label: "Não migrar" },
  { value: "tecnica", label: "Recriar" },
];

const RISCO_PESO: Record<string, number> = { alto: 2, medio: 1, baixo: 0 };

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
  {
    key: "tamanho",
    label: "Tamanho",
    align: "right",
    sortable: true,
    sortValue: (t) => t.totalBytes,
    render: (t) => formatBytes(t.totalBytes),
  },
  {
    key: "risco",
    label: "Risco",
    sortable: true,
    sortValue: (t) => RISCO_PESO[t.risco],
    render: (t) => <RiscoBadge risco={t.risco} />,
  },
  {
    key: "sugestao",
    label: "Sugestão",
    sortable: true,
    sortValue: (t) => t.sugestaoRotulo,
    render: (t) => <SugestaoBadge classe={t.sugestaoClasse} rotulo={t.sugestaoRotulo} />,
  },
  {
    key: "nota",
    label: "Anotação do mapeamento manual",
    render: (t) => (
      <span className="text-xs" style={{ color: "var(--ds-color-text-muted)" }}>
        {t.nota}
      </span>
    ),
  },
];

export function InventarioTable({ tabelas, dominios }: { tabelas: Tabela[]; dominios: Dominio[] }) {
  const [dominioId, setDominioId] = useState("");
  const [status, setStatus] = useState("");
  const [busca, setBusca] = useState("");
  const [range, setRange] = useState<RangeInfo | null>(null);

  const filtradas = useMemo(() => {
    const buscaLower = busca.toLowerCase();
    return tabelas.filter((t) => {
      if (dominioId && t.dominioId !== dominioId) return false;
      if (status && t.sugestaoClasse !== status) return false;
      if (buscaLower && !`${t.table} ${t.nomeNegocio}`.toLowerCase().includes(buscaLower)) return false;
      return true;
    });
  }, [tabelas, dominioId, status, busca]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-3 items-end">
        <label className="ds-field" style={{ maxWidth: 260 }}>
          <span className="ds-field__label">Buscar</span>
          <input
            className="ds-input"
            placeholder="nome técnico ou de negócio"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </label>
        <Select
          label="Bloco funcional"
          value={dominioId}
          onChange={setDominioId}
          todosLabel="Todos"
          opcoes={dominios.map((d) => ({ value: d.id, label: d.label }))}
        />
        <Select label="Sugestão" value={status} onChange={setStatus} todosLabel="Todas" opcoes={STATUS_OPCOES} />
        <span className="text-sm ml-auto" style={{ color: "var(--ds-color-text-muted)" }}>
          {range ? `Mostrando ${range.from}–${range.to} de ${range.total}` : `${filtradas.length} de ${tabelas.length}`} tabelas
        </span>
      </div>
      <DataTable columns={colunas} rows={filtradas} rowKey={(t) => t.table} onRangeChange={setRange} />
    </div>
  );
}
