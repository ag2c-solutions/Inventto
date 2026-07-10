/** Extrai os valores de cada atributo do variantLabel.
 *  Formato esperado: "Cor: White|#FFFFFF / Tamanho: S"
 *  Retorna um array de strings com os valores brutos (ex: ["White|#FFFFFF", "S"])
 */
export function parseVariantValues(variantLabel: string): string[] {
  return variantLabel
    .split('/')
    .map((segment) => {
      const colonIndex = segment.indexOf(':');
      return colonIndex !== -1
        ? segment.slice(colonIndex + 1).trim()
        : segment.trim();
    })
    .filter(Boolean);
}
