import fs from "node:fs";
import path from "node:path";

// ponytail: leitura direta via fs.readFileSync — sem abstração source/version/dataset
// genérica (como em bi-setdig/src/lib/data.ts), é 1 dataset só.
const DATASET_PATH = path.join(process.cwd(), "datasets", "eds", "v1", "inventario.json");

export type Coluna = { name: string; type: string; nullable: boolean };
export type ForeignKey = { column: string; refTable: string; refColumn: string };
export type SugestaoClasse = "nao-migrar" | "tecnica" | "avaliar" | "migrar";
export type Risco = "alto" | "medio" | "baixo";

export type Tabela = {
  schema: string;
  table: string;
  nomeNegocio: string;
  dominioId: string;
  dominioLabel: string;
  columns: Coluna[];
  pk: string[];
  fks: ForeignKey[];
  count: number;
  countEstimated: boolean;
  totalBytes: number;
  sugestaoClasse: SugestaoClasse;
  sugestaoRotulo: string;
  risco: Risco;
  nota: string;
  mapeada: boolean;
};

export type Dominio = { id: string; label: string; descricao: string; critico: boolean };
export type ResumoDominio = { dominioId: string; label: string; total: number; vazias: number; registros: number };
export type ParetoItem = { table: string; nomeNegocio: string; registros: number; acumuladoPct: number };
export type Decisao = { descartar: number; avaliar: number; migrar: number; recriar: number };

export type InventarioEds = {
  extraidoEm: string;
  tabelas: Tabela[];
  dominios: Dominio[];
  resumoDominios: ResumoDominio[];
  decisao: Decisao;
  paretoTop10: ParetoItem[];
  perguntasAbertas: string[];
  der: Record<string, string>;
};

let cache: InventarioEds | null = null;

export function getInventarioEds(): InventarioEds {
  if (!cache) {
    cache = JSON.parse(fs.readFileSync(DATASET_PATH, "utf-8"));
  }
  return cache!;
}
