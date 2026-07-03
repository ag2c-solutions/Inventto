import { cn } from '@/shared/utils';

import type { IProductVariant } from '../../../../domain/entities';
import { getGradeStockConsolidation } from '../../../../domain/utils/get-grade-stock-consolidation';
import { getStockStatus } from '../../../../domain/utils/get-stock-status';
import { LEGEND_ORDER } from '../../../constants/legend-order';
import { STOCK_STATUS_CONFIG } from '../../../constants/status-config';

type ProductTableColumnStockProps = {
  totalStock: number;
  minimumStock?: number;
  variants?: IProductVariant[];
};

export function ProductTableColumnStock({
  totalStock,
  minimumStock,
  variants = []
}: ProductTableColumnStockProps) {
  if (variants.length === 0) {
    const status = getStockStatus(totalStock, minimumStock);
    const config = STOCK_STATUS_CONFIG[status];

    return (
      <div className="flex items-center gap-1.5">
        <span
          className={cn(
            'flex items-center gap-1 bg-transparent!',
            config.badgeClassName
          )}
        >
          {config.iconSmall}1
        </span>
      </div>
    );
  }

  const { summary } = getGradeStockConsolidation(variants);

  return (
    <div className="flex items-center gap-1.5">
      {LEGEND_ORDER.filter((status) => summary[status] > 0).map((status) => {
        const config = STOCK_STATUS_CONFIG[status];

        return (
          <span
            key={status}
            className={cn(
              'flex items-center gap-1 bg-transparent!',
              config.badgeClassName
            )}
          >
            {config.iconSmall}
            {summary[status]}
          </span>
        );
      })}
    </div>
  );
}
