export function generateProductSku(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((word) => word.slice(0, 3).toUpperCase())
    .join('-');
}
