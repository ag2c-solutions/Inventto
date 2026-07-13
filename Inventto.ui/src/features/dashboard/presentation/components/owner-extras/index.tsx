import { Coins, Eye, Percent } from 'lucide-react';

import { formatCurrency } from '@/shared/utils/formatters/format-currency';

import type { Role } from '@/features/permissions';

const marginFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'percent',
  maximumFractionDigits: 1
});

interface OwnerExtrasProps {
  role: Role;
  inventoryAtCost?: number;
  avgMargin?: number;
}

export function OwnerExtras({
  role,
  inventoryAtCost,
  avgMargin
}: OwnerExtrasProps) {
  // RN091: margem média e inventário a custo são exclusivos do Dono.
  if (role !== 'owner') return null;

  return (
    <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-stretch gap-4 border-t pt-4">
      <div className="flex flex-col gap-1">
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <Coins className="size-3.5" />
          Inventário a custo
        </span>
        <span className="text-lg font-semibold">
          {formatCurrency(inventoryAtCost) ?? 'R$ 0,00'}
        </span>
        <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <Eye className="size-3" />
          exclusivo do Dono · RN091
        </span>
      </div>

      <div className="w-px bg-border" aria-hidden />

      <div className="flex flex-col gap-1">
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <Percent className="size-3.5" />
          Margem média
        </span>
        <span className="text-lg font-semibold">
          {marginFormatter.format(avgMargin ?? 0)}
        </span>
        <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <Eye className="size-3" />
          exclusivo do Dono · RN091
        </span>
      </div>
    </div>
  );
}
