import { Badge } from '@/shared/components/ui/badge';
import { cn } from '@/shared/utils';

import type { IProductVariant } from '../../../domain/entities';
import { getGradeStockConsolidation } from '../../../domain/utils/get-grade-stock-consolidation';
import { LEGEND_ORDER } from '../../constants/legend-order';
import { STOCK_STATUS_CONFIG } from '../../constants/status-config';

type ProductGradeSummaryProps = {
  variants: IProductVariant[];
  /** `stacked` (default): coluna estreita, um status por linha — usado no Popover da lista.
   *  `inline`: uma linha por resumo, badge + contagem lado a lado — usado no Detalhe (2.3.3). */
  layout?: 'stacked' | 'inline';
};

export function ProductGradeSummary({
  variants,
  layout = 'stacked'
}: ProductGradeSummaryProps) {
  const { total, summary } = getGradeStockConsolidation(variants);
  const isInline = layout === 'inline';

  if (isInline) {
    const activeCount = variants.filter((variant) => variant.isActive).length;

    return (
      <div className="rounded-xl border bg-muted/30 p-4 flex flex-col gap-4">
        {/* Header label */}
        <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
          Resumo da grade
        </p>

        {/* Status badges */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          {LEGEND_ORDER.filter((status) => summary[status] > 0).map(
            (status) => {
              const config = STOCK_STATUS_CONFIG[status];

              return (
                <span key={status} className="flex items-center gap-1.5">
                  <Badge
                    variant="outline"
                    className={cn('gap-1', config.badgeClassName)}
                  >
                    {config.iconSmall}
                    {config.label}
                  </Badge>
                  <span className="font-semibold tabular-nums text-foreground">
                    {summary[status]}
                  </span>
                </span>
              );
            }
          )}
        </div>

        {/* Footer */}
        <p className="text-sm text-muted-foreground border-t pt-3">
          Total físico <b className="text-foreground">{total} un.</b> ·{' '}
          {activeCount === 1 ? '1 item único' : `${activeCount} variantes`}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-semibold">Resumo da grade</p>

      <div className="flex flex-col gap-1.5">
        {LEGEND_ORDER.filter((status) => summary[status] > 0).map((status) => {
          const config = STOCK_STATUS_CONFIG[status];

          return (
            <div
              key={status}
              className="flex items-center justify-between text-xs"
            >
              <span
                className={cn(
                  'flex items-center gap-1.5 font-medium',
                  config.textClassName
                )}
              >
                {config.iconSmall}
                {config.label}
              </span>

              <span className="font-semibold tabular-nums text-foreground">
                {summary[status]}
              </span>
            </div>
          );
        })}
      </div>

      <div className="border-t pt-2">
        <p className="text-xs font-semibold text-center text-muted-foreground">
          Total físico: {total} un.
        </p>
      </div>
    </div>
  );
}
