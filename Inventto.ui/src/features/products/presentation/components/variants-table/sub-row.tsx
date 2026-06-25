import { cn, parseColorValue } from '@/shared/utils';

import type { IProductVariant } from '../../../domain/entities';
import type { ProductStockStatus } from '../../../domain/entities';
import { getGradeStockConsolidation } from '../../../domain/utils/get-grade-stock-consolidation';
import { getStockStatus } from '../../../domain/utils/get-stock-status';
import { STOCK_STATUS_CONFIG } from '../../constants/status-config';

const LEGEND_ORDER: ProductStockStatus[] = [
  'healthy',
  'warning',
  'critical',
  'zeroed'
];

/** Layout compartilhado entre o cabeçalho da grade e as linhas de variante. */
const GRID =
  'grid grid-cols-[2.5rem_minmax(8rem,12rem)_1fr_auto] items-center gap-4';

function findColorHex(variant: IProductVariant): string | undefined {
  const colorOption = variant.options.find((option) =>
    option.value.includes('#')
  );

  return colorOption ? parseColorValue(colorOption.value).hex : undefined;
}

type ProductVariantsSubRowProps = {
  variants: IProductVariant[];
};

export function ProductVariantsSubRow({
  variants
}: ProductVariantsSubRowProps) {
  const { total } = getGradeStockConsolidation(variants);

  return (
    <div className="bg-background px-4 py-3">
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

      <div className="overflow-hidden rounded-lg border bg-card">
        <div
          className={cn(
            GRID,
            'border-b bg-muted/30 px-4 py-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground'
          )}
        >
          <span />
          <span>SKU</span>
          <span>Atributos</span>
          <span className="justify-self-end">Estoque</span>
        </div>

        {variants.map((variant) => {
          const status = getStockStatus(variant.stock, variant.minimumStock);
          const config = STOCK_STATUS_CONFIG[status];
          const colorHex = findColorHex(variant);
          const isZeroed = status === 'zeroed';

          return (
            <div
              key={variant.id}
              className={cn(
                GRID,
                'border-b px-4 py-3 last:border-b-0',
                isZeroed && 'bg-muted/40'
              )}
            >
              <span
                className="size-10 rounded-md border bg-muted"
                style={colorHex ? { backgroundColor: colorHex } : undefined}
              />

              <span className="truncate font-mono text-sm text-foreground">
                {variant.sku}
              </span>

              <div className="flex flex-wrap items-center gap-1.5">
                {variant.options.map((option, index) => {
                  const isColor = option.value.includes('#');

                  if (isColor) {
                    const { name, hex } = parseColorValue(option.value);

                    return (
                      <span
                        key={`${variant.id}-${option.name}-${index}`}
                        className="inline-flex items-center gap-1.5 rounded-md bg-secondary px-2 py-0.5 text-xs text-secondary-foreground"
                      >
                        <span
                          className="size-3 rounded-full border shadow-sm"
                          style={{ backgroundColor: hex }}
                        />
                        {name}
                      </span>
                    );
                  }

                  return (
                    <span
                      key={`${variant.id}-${option.name}-${index}`}
                      className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-0.5 text-xs text-secondary-foreground"
                    >
                      <span className="text-muted-foreground">
                        {option.name}
                      </span>
                      <span className="font-medium">{option.value}</span>
                    </span>
                  );
                })}
              </div>

              <div className="flex items-center justify-self-end gap-1.5 text-sm">
                <span
                  className={cn('flex items-center', config.textClassName)}
                  title={config.label}
                  aria-label={`Status do estoque: ${config.label}`}
                >
                  {config.iconSmall}
                </span>
                <span className="font-medium tabular-nums text-foreground">
                  {variant.stock}
                </span>
                <span className="text-xs text-muted-foreground">
                  (Mín {variant.minimumStock})
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
