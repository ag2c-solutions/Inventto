import { useMovementForm } from '../../hooks';
import { MovementBatchList } from '../movement-batch-list';
import { ProductSearch } from '../product-search';

export function MovementProductsSection() {
  const { form } = useMovementForm();
  const items = form.watch('items');
  const hasItems = items && items.length > 0;

  return (
    <div className="mt-6 pt-5 border-t">
      <div className="flex items-center justify-between gap-3 mb-3">
        <span className="text-sm font-semibold">Produtos</span>
        <ProductSearch />
      </div>

      {hasItems ? (
        <MovementBatchList />
      ) : (
        <div className="rounded-lg border border-dashed py-7 px-4 text-center text-sm text-muted-foreground">
          Nenhum produto adicionado ainda.
        </div>
      )}
    </div>
  );
}
