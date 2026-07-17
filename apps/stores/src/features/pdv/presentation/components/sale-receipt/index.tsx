import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CheckCircle2, Download, Loader2, Share2 } from 'lucide-react';

import { Button } from '@/shared/components/ui/button';
import { SheetHeader, SheetTitle } from '@/shared/components/ui/sheet';
import { formatIntegerToDecimal } from '@/shared/utils';
import { formatCurrency } from '@/shared/utils/formatters/format-currency';

import type { ConfirmedSale } from '../../../domain/entities';
import { PAYMENT_METHOD_LABELS } from '../../constants';

import { useSaleReceipt } from './hooks/use-sale-receipt';

interface SaleReceiptProps {
  sale: ConfirmedSale;
  onNewSale: () => void;
}

export function SaleReceipt({ sale, onNewSale }: SaleReceiptProps) {
  const { isDownloading, isSharing, handleDownload, handleShare } =
    useSaleReceipt(sale);

  return (
    <div className="flex flex-1 flex-col">
      <SheetHeader className="border-b px-5 py-4">
        <div className="flex items-center gap-2 text-emerald-600">
          <CheckCircle2 className="h-5 w-5" />
          <SheetTitle className="text-lg text-foreground">
            Venda concluída
          </SheetTitle>
        </div>
        <p className="text-sm text-sidebar-foreground">
          {format(sale.confirmedAt, "dd/MM/yyyy 'às' HH:mm", {
            locale: ptBR
          })}
        </p>
      </SheetHeader>

      <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-5 py-4">
        <div className="flex flex-col divide-y">
          {sale.items.map((item) => {
            const unitFinal = item.unitPrice - item.discount;
            const lineTotal = unitFinal * item.quantity;

            return (
              <div
                key={`${item.productId}-${item.variantId ?? 'base'}`}
                className="flex items-center justify-between gap-2 py-2 text-sm"
              >
                <div className="flex flex-col">
                  <span className="font-medium">{item.name}</span>
                  {item.variantLabel && (
                    <span className="text-xs text-muted-foreground">
                      {item.variantLabel}
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {item.quantity}x{' '}
                    {formatCurrency(formatIntegerToDecimal(unitFinal))}
                  </span>
                </div>
                <span className="font-semibold">
                  {formatCurrency(formatIntegerToDecimal(lineTotal))}
                </span>
              </div>
            );
          })}
        </div>

        <div className="flex flex-col gap-2 border-t pt-4 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatCurrency(formatIntegerToDecimal(sale.subtotal))}</span>
          </div>

          {sale.discountTotal > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Descontos</span>
              <span className="text-destructive">
                − {formatCurrency(formatIntegerToDecimal(sale.discountTotal))}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between text-base font-bold">
            <span>Total</span>
            <span>{formatCurrency(formatIntegerToDecimal(sale.total))}</span>
          </div>
        </div>

        <div className="flex flex-col gap-1 border-t pt-4 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Forma de pagamento</span>
            <span>{PAYMENT_METHOD_LABELS[sale.paymentMethod]}</span>
          </div>

          {sale.paymentMethod === 'cash' && sale.amountPaid != null && (
            <>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Valor recebido</span>
                <span>
                  {formatCurrency(formatIntegerToDecimal(sale.amountPaid))}
                </span>
              </div>

              {sale.changeAmount != null && sale.changeAmount > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Troco</span>
                  <span>
                    {formatCurrency(formatIntegerToDecimal(sale.changeAmount))}
                  </span>
                </div>
              )}
            </>
          )}
        </div>

        {sale.customer && (
          <div className="flex items-center justify-between border-t pt-4 text-sm">
            <span className="text-muted-foreground">Cliente</span>
            <span>
              {sale.customer.displayName ??
                sale.customer.name ??
                sale.customer.phone}
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2 border-t px-5 py-4">
        <div className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleDownload}
            disabled={isDownloading}
          >
            {isDownloading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Baixar PDF
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={handleShare}
            disabled={isSharing}
          >
            {isSharing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Share2 className="h-4 w-4" />
            )}
            Compartilhar
          </Button>
        </div>

        <Button
          type="button"
          variant="ghost"
          className="w-full"
          onClick={onNewSale}
        >
          Nova venda
        </Button>
      </div>
    </div>
  );
}
