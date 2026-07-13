import { Separator } from '@/shared/components/ui/separator';
import { formatCurrency } from '@/shared/utils/formatters/format-currency';

import type { OwnSalesToday } from '../../../domain/entities';

interface SalesSimpleProps {
  ownSalesToday?: OwnSalesToday;
}

export function SalesSimple({ ownSalesToday }: SalesSimpleProps) {
  return (
    <div className="flex items-center gap-6 rounded-lg border p-4">
      <div className="flex flex-col gap-1">
        <span className="text-2xl font-bold">{ownSalesToday?.count ?? 0}</span>
        <span className="text-sm text-muted-foreground">vendas realizadas</span>
      </div>
      <Separator orientation="vertical" className="h-10" />
      <div className="flex flex-col gap-1">
        <span className="text-2xl font-bold">
          {formatCurrency(ownSalesToday?.total) ?? 'R$ 0,00'}
        </span>
        <span className="text-sm text-muted-foreground">total do dia</span>
      </div>
    </div>
  );
}
