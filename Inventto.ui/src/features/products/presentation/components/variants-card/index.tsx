import type { IProduct, IProductVariant } from '../../../domain/entities';
import { getGradeStockConsolidation } from '../../../domain/utils/get-grade-stock-consolidation';
import { LEGEND_ORDER } from '../../constants/legend-order';
import { STOCK_STATUS_CONFIG } from '../../constants/status-config';
import { ProductVariantsTable } from '../variants-list';

type ProductVariantsCardProps = {
  variants: IProductVariant[];
  productImages: IProduct['allImages'];
};

export function ProductVariantsCard({
  variants,
  productImages
}: ProductVariantsCardProps) {
  const { total } = getGradeStockConsolidation(variants);

  return (
    <div className="bg-sidebar px-4 py-3">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {variants.length} {variants.length === 1 ? 'variante' : 'variantes'} ·{' '}
          {total} un. em estoque
        </span>

        <div className="flex items-center gap-4">
          {LEGEND_ORDER.map((status) => {
            const config = STOCK_STATUS_CONFIG[status];

            return (
              <span
                key={status}
                className="flex items-center gap-1.5 text-xs text-muted-foreground"
              >
                <span
                  className="size-2 rounded-full"
                  style={{ backgroundColor: `var(--status-${status})` }}
                />
                {config.label}
              </span>
            );
          })}
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border bg-card flex flex-col gap-3 ">
        <ProductVariantsTable
          productImages={productImages}
          variants={variants}
        />
      </div>
    </div>
  );
}
