import { Calendar, Search, User } from 'lucide-react';

import { Input } from '@/shared/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/shared/components/ui/select';

import type { IMember } from '@/features/organizations';
import { usePermission } from '@/features/permissions';

import type { OrderFilters, OrderPeriod } from '../../../domain/entities';

const PERIOD_LABELS: Record<OrderPeriod, string> = {
  today: 'Hoje',
  '7d': 'Últimos 7 dias',
  '30d': 'Últimos 30 dias',
  '90d': 'Últimos 90 dias',
  all: 'Todo o período'
};

interface OrdersFiltersProps {
  filters: OrderFilters;
  onChange: (filters: OrderFilters) => void;
  sellers: IMember[];
}

// RF034: busca + período sempre visíveis; filtro de vendedor só para
// Owner/Manager (order:view_all) — Sales já vê só pool + próprios via RLS.
export function OrdersFilters({
  filters,
  onChange,
  sellers
}: OrdersFiltersProps) {
  const { can } = usePermission();
  const canFilterBySeller = can('order:view_all');

  return (
    // PED-06: no mobile (<md) os filtros empilham (100% de largura cada);
    // a partir de md voltam a ficar lado a lado com wrap (comportamento
    // original do painel desktop).
    <div className="flex flex-col items-stretch gap-2.5 md:flex-row md:flex-wrap md:items-center">
      <div className="relative md:max-w-[320px] md:flex-1 md:basis-64">
        <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome ou telefone do cliente"
          value={filters.search ?? ''}
          onChange={(event) =>
            onChange({ ...filters, search: event.target.value })
          }
          className="pl-9"
        />
      </div>

      <Select
        value={filters.period ?? 'all'}
        onValueChange={(value) =>
          onChange({ ...filters, period: value as OrderPeriod })
        }
      >
        <SelectTrigger className="h-[38px] w-full gap-2 rounded-[9px] px-3 md:w-auto">
          <Calendar className="size-[15px] text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Período</span>
          <SelectValue className="font-semibold" />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(PERIOD_LABELS).map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {canFilterBySeller && (
        <Select
          value={filters.sellerId ?? 'all'}
          onValueChange={(value) =>
            onChange({
              ...filters,
              sellerId: value === 'all' ? undefined : value
            })
          }
        >
          <SelectTrigger className="h-[38px] w-full gap-2 rounded-[9px] px-3 md:w-auto">
            <User className="size-[15px] text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Vendedor</span>
            <SelectValue className="font-semibold" placeholder="Todos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os vendedores</SelectItem>
            {sellers.map((seller) => (
              <SelectItem key={seller.profileId} value={seller.profileId}>
                {seller.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
