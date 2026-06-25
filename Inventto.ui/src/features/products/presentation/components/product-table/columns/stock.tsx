import { Button } from '@/shared/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/shared/components/ui/tooltip';

import type { IProductVariant } from '../../../../domain/entities';
import { getStockStatus } from '../../../../domain/utils/get-stock-status';
import {
  getStockSummaryStatus,
  type StockSummary
} from '../../../../domain/utils/get-stock-summary-status';
import { STOCK_STATUS_CONFIG } from '../../../constants/status-config';

type StockSummaryRowProps = {
  label: string;
  count: number;
  className: string;
  badgeClassName: string;
};

function StockSummaryRow({
  label,
  count,
  className,
  badgeClassName
}: StockSummaryRowProps) {
  return (
    <div className="flex justify-between items-center text-xs">
      <span className={`${className} font-medium`}>{label}</span>

      <span className={`${badgeClassName} px-1.5 py-0.5 rounded-md font-bold`}>
        {count} {count === 1 ? 'variação' : 'variações'}
      </span>
    </div>
  );
}

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
          <div className="flex flex-col gap-1">
            <p className="font-semibold">{config.label}</p>

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

  const summary = variants.reduce<StockSummary>(
    (acc, variant) => {
      const status = getStockStatus(variant.stock, variant.minimumStock);

      acc[status] += 1;

      return acc;
    },
    {
      critical: 0,
      warning: 0,
      healthy: 0
    }
  );

  const mainStatus = getStockSummaryStatus(summary);
  const mainConfig = STOCK_STATUS_CONFIG[mainStatus];

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          className="h-10 w-10 p-0 hover:bg-transparent"
          aria-label={`Status do estoque: ${mainConfig.label}`}
        >
          {mainConfig.icon}
        </Button>
      </TooltipTrigger>

      <TooltipContent className="bg-sidebar/70 border border-border rounded-md min-w-[200px]">
        <div className="flex flex-col gap-2 p-1">
          <div className="flex items-center gap-2 border-b pb-2">
            {mainConfig.iconSmall}
            <span className="font-semibold text-sidebar-foreground">
              Resumo da grade
            </span>
          </div>

          <div className="space-y-1.5">
            {summary.critical > 0 && (
              <StockSummaryRow
                label="Crítico"
                count={summary.critical}
                className="text-red-600"
                badgeClassName="bg-red-100 text-red-700"
              />
            )}

            {summary.warning > 0 && (
              <StockSummaryRow
                label="Atenção"
                count={summary.warning}
                className="text-orange-600"
                badgeClassName="bg-orange-100 text-orange-700"
              />
            )}

            {summary.healthy > 0 && (
              <StockSummaryRow
                label="Saudável"
                count={summary.healthy}
                className="text-green-600"
                badgeClassName="bg-green-100 text-green-700"
              />
            )}
          </div>

          <div className="border-t pt-2 mt-1">
            <p className="text-[10px] text-sidebar-foreground font-semibold text-center">
              Total físico: {totalStock} un.
            </p>
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
