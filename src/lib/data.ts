import fs from "node:fs";
import path from "node:path";

export type DatasetId = "admin" | "controlador";

export type DominioMeta = { id: DatasetId; label: string; descricao: string };

export const DOMINIOS_DISPONIVEIS: DominioMeta[] = [
  { id: "admin", label: "Admin", descricao: "Carta de Serviço, órgãos, unidades, atendimento — banco admin_prd" },
  { id: "controlador", label: "Controlador", descricao: "Login federado gov.br, autenticação, pessoa — banco controlador_prd" },
];

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

const cache = new Map<DatasetId, InventarioEds>();

export function getInventario(dataset: DatasetId): InventarioEds {
  let inv = cache.get(dataset);
  if (!inv) {
    const p = path.join(process.cwd(), "datasets", dataset, "v1", "inventario.json");
    inv = JSON.parse(fs.readFileSync(p, "utf-8"));
    cache.set(dataset, inv!);
  }
  return inv!;
}

export const getInventarioAdmin = () => getInventario("admin");
