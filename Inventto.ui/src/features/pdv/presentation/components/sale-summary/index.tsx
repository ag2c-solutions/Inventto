import { formatIntegerToDecimal } from '@/shared/utils';
import { formatCurrency } from '@/shared/utils/formatters/format-currency';

interface SaleSummaryProps {
  subtotal: number;
  discountTotal: number;
  total: number;
}

export function SaleSummary({
  subtotal,
  discountTotal,
  total
}: SaleSummaryProps) {
  return (
    <div className="flex flex-col gap-2 px-5 py-4 text-sm">
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground">Subtotal</span>
        <span>{formatCurrency(formatIntegerToDecimal(subtotal))}</span>
      </div>

      {discountTotal > 0 && (
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Total de descontos</span>
          <span className="text-destructive">
            − {formatCurrency(formatIntegerToDecimal(discountTotal))}
          </span>
        </div>
      )}

      <div className="my-1 border-t" />

      <div className="flex items-center justify-between">
        <span className="text-base font-bold">Total</span>
        <span className="text-xl font-bold">
          {formatCurrency(formatIntegerToDecimal(total))}
        </span>
      </div>
    </div>
  );
}
