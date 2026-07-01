import { VisibleTo } from '@/features/permissions';

import { Badge } from '@/shared/components/ui/badge';
import { cn } from '@/shared/utils';
import { formatCurrency } from '@/shared/utils/formatters/format-currency';

import { getStockStatus } from '../../../domain/utils/get-stock-status';
import { STOCK_STATUS_CONFIG } from '../../constants/status-config';

type ProductInventoryCardProps = {
  minimumStock?: number;
  stock?: number;
  costPrice?: number;
};

export function ProductInventoryCard({
  minimumStock = 0,
  stock = 0,
  costPrice
}: ProductInventoryCardProps) {
  const status = getStockStatus(stock, minimumStock);
  const config = STOCK_STATUS_CONFIG[status];

  return (
    <div className="rounded-xl border bg-muted/30 p-4 flex flex-col gap-4">
      {/* Header label */}
      <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
        Estoque
      </p>

      {/* Main stock display */}
      <div className="flex items-center gap-3">
        {config.icon}

        <p className="font-bold text-3xl">{stock} un.</p>

        <Badge
          variant="outline"
          className={cn('ml-auto gap-1', config.badgeClassName)}
        >
          {config.iconSmall}
          {config.label}
        </Badge>
      </div>

      {/* Details rows */}
      <div className="flex flex-col gap-2 border-t pt-3">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm text-muted-foreground">Estoque mínimo</p>
          <p className="text-sm text-muted-foreground text-right">
            {minimumStock} un.
          </p>
        </div>

        <VisibleTo action="stock:view_costs">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm text-muted-foreground">
              Custo médio ponderado
            </p>
            <p className="text-sm font-medium text-right">
              {formatCurrency(costPrice)}
            </p>
          </div>

          <div className="flex items-start justify-between gap-2">
            <p className="text-sm text-muted-foreground">
              Custo total do estoque
            </p>
            <p className="text-sm font-medium text-right">
              {formatCurrency(costPrice && costPrice * stock)}
            </p>
          </div>
        </VisibleTo>
      </div>
    </div>
  );
}
