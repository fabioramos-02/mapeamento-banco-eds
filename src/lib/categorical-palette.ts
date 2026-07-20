// Copiado de bi-setdig/src/lib/categorical-palette.ts
export const PALETA_CATEGORICA = [
  "--ds-color-primary-600",
  "--ds-color-secondary-600",
  "--ds-color-blue-600",
  "--ds-color-orange-600",
  "--ds-color-green-600",
  "--ds-color-neutral-500",
];

export function corCategorica(index: number): string {
  return `var(${PALETA_CATEGORICA[index % PALETA_CATEGORICA.length]})`;
}
