import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/shared/components/ui/popover';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/shared/components/ui/tooltip';
import { cn } from '@/shared/utils';

import type {
  IProductVariant,
  ProductStockStatus
} from '../../../../domain/entities';
import { getGradeStockConsolidation } from '../../../../domain/utils/get-grade-stock-consolidation';
import { getStockStatus } from '../../../../domain/utils/get-stock-status';
import { getStockSummaryStatus } from '../../../../domain/utils/get-stock-summary-status';
import { STOCK_STATUS_CONFIG } from '../../../constants/status-config';

/** Ordem de exibição do resumo da grade (saudável → zerado). */
const GRADE_SUMMARY_ORDER: ProductStockStatus[] = [
  'healthy',
  'warning',
  'critical',
  'zeroed'
];

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
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            className="h-10 w-10 p-0 hover:bg-transparent"
            aria-label={`Status do estoque: ${config.label}`}
          >
            {config.icon}
          </Button>
        </TooltipTrigger>

        <TooltipContent>
          <div className="flex flex-col gap-1.5">
            <Badge
              variant="outline"
              className={cn('w-fit gap-1', config.badgeClassName)}
            >
              {config.iconSmall}
              {config.label}
            </Badge>

            <p className="text-xs text-muted-foreground">
              Estoque atual: {totalStock}
            </p>

            {minimumStock !== undefined && (
              <p className="text-xs text-muted-foreground">
                Estoque mínimo: {minimumStock}
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    );
  }

  const { total, summary } = getGradeStockConsolidation(variants);
  const mainStatus = getStockSummaryStatus(summary);
  const mainConfig = STOCK_STATUS_CONFIG[mainStatus];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          className="h-10 w-10 p-0 hover:bg-transparent"
          aria-label={`Status do estoque: ${mainConfig.label}`}
        >
          {mainConfig.icon}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-56 p-3">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold">Resumo da grade</p>

          <div className="flex flex-col gap-1.5">
            {GRADE_SUMMARY_ORDER.filter((status) => summary[status] > 0).map(
              (status) => {
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
              }
            )}
          </div>

          <div className="border-t pt-2">
            <p className="text-xs font-semibold text-center text-muted-foreground">
              Total físico: {total} un.
            </p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
