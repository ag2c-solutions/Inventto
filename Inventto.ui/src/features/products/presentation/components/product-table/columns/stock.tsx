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

import type { IProductVariant } from '../../../../domain/entities';
import { getGradeStockConsolidation } from '../../../../domain/utils/get-grade-stock-consolidation';
import { getStockStatus } from '../../../../domain/utils/get-stock-status';
import { getStockSummaryStatus } from '../../../../domain/utils/get-stock-summary-status';
import { STOCK_STATUS_CONFIG } from '../../../constants/status-config';
import { ProductGradeSummary } from '../../grade-summary';

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

  const { summary } = getGradeStockConsolidation(variants);
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
        <ProductGradeSummary variants={variants} />
      </PopoverContent>
    </Popover>
  );
}
