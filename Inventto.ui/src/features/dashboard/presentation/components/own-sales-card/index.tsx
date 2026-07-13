import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ShoppingBag, ShoppingCart } from 'lucide-react';

import { Card } from '@/shared/components/ui/card';
import { formatCurrency } from '@/shared/utils/formatters/format-currency';

import type { OwnRecentSale } from '../../../domain/entities';

interface OwnSalesCardProps {
  sales: OwnRecentSale[];
}

export function OwnSalesCard({ sales }: OwnSalesCardProps) {
  return (
    <Card className="gap-0 overflow-hidden py-0">
      <div className="flex items-center gap-2 border-b px-4 py-3">
        <ShoppingCart className="size-3.5 text-muted-foreground" />
        <h3 className="text-xs font-semibold tracking-wide uppercase">
          Suas últimas vendas
        </h3>
      </div>

      {sales.length === 0 ? (
        <p className="p-4 text-sm text-muted-foreground">
          Nenhuma venda ainda.
        </p>
      ) : (
        <ul>
          {sales.map((sale) => (
            <li
              key={sale.id}
              className="flex items-center gap-3 border-b px-4 py-3 last:border-b-0"
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-md border bg-muted/50 text-muted-foreground">
                <ShoppingBag className="size-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-mono text-sm font-medium">
                  #{sale.code}
                </span>
                <span className="block text-xs text-muted-foreground">
                  {sale.itemsCount} {sale.itemsCount === 1 ? 'item' : 'itens'} ·{' '}
                  {formatDistanceToNow(sale.updatedAt, {
                    addSuffix: true,
                    locale: ptBR
                  })}
                </span>
              </span>
              <span className="shrink-0 font-mono text-sm font-bold">
                {formatCurrency(sale.total) ?? 'R$ 0,00'}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
