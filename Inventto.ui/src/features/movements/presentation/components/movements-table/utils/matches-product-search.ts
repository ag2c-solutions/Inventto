import type { Movement } from '../../../../domain/entities';

export function matchesProductSearch(movement: Movement, term: string) {
  const query = term.trim().toLowerCase();

  if (!query) return true;

  return movement.items.some(
    (item) =>
      item.product.name.toLowerCase().includes(query) ||
      (item.product.sku ?? '').toLowerCase().includes(query)
  );
}

export function resolveProductNameById(
  movements: Movement[],
  productId?: string
) {
  if (!productId) return undefined;

  for (const movement of movements) {
    const item = movement.items.find((it) => it.productId === productId);
    if (item) return item.product.name;
  }

  return undefined;
}
