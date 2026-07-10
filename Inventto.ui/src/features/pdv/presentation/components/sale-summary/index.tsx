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
    <div className="flex flex-col gap-1.5 rounded-lg border p-3 text-sm">
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

      <div className="flex items-center justify-between font-bold">
        <span>Total</span>
        <span>{formatCurrency(formatIntegerToDecimal(total))}</span>
      </div>
    </div>
  );
}
