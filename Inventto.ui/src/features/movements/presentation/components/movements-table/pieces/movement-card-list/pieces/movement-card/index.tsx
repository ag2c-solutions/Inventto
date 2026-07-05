import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ArrowDown, ArrowUp, ChevronRight, Cpu, FileText } from 'lucide-react';

import { ImageCard } from '@/shared/components/common/image-card';
import {
  Avatar,
  AvatarFallback,
  AvatarImage
} from '@/shared/components/ui/avatar';
import { Badge } from '@/shared/components/ui/badge';
import { Separator } from '@/shared/components/ui/separator';
import { cn } from '@/shared/utils';

import { VisibleTo } from '@/features/permissions';

import type { Movement } from '../../../../../../../domain/entities';

const currency = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL'
});

const getInitials = (name: string) =>
  name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

function MovementCardResponsible({ user }: { user?: Movement['user'] }) {
  if (!user) {
    return (
      <span className="flex items-center  gap-1.5 text-xs text-muted-foreground">
        <span className="flex h-5 w-5 items-center justify-center rounded-full border bg-muted">
          <Cpu className="h-2.5 w-2.5" />
        </span>
        Sistema
      </span>
    );
  }

  return (
    <span className="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
      <Avatar className="h-5 w-5 shrink-0">
        <AvatarImage src={user.avatarUrl || undefined} />
        <AvatarFallback className="text-[9px]">
          {getInitials(user.fullName)}
        </AvatarFallback>
      </Avatar>
      <span className="max-w-[92px] truncate">{user.fullName}</span>
    </span>
  );
}

function MovementCardItems({ movement }: { movement: Movement }) {
  const isSale = !!movement.reason?.toLowerCase().includes('venda');
  const isEntry = movement.type === 'entry';

  return (
    <div className="border-t bg-sidebar">
      {movement.reason === 'Outro' && movement.description && (
        <p className="border-b px-3 py-2.5 text-xs italic text-muted-foreground">
          &ldquo;{movement.description}&rdquo;
        </p>
      )}
      {movement.items.map((item) => {
        const itemValue = isSale
          ? item.netValue || 0
          : item.unitCost * item.quantity;

        return (
          <div
            key={item.id}
            className="flex items-start gap-3 border-b px-3 py-2.5 last:border-b-0"
          >
            <div className="h-9 w-9 shrink-0 overflow-hidden rounded-md border bg-muted">
              <ImageCard
                src={item.product.imageUrl || '/placeholder.svg'}
                alt={item.product.name}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">
                {item.product.name}
              </p>
              {item.product.sku && (
                <p className="truncate font-mono text-[11px] text-muted-foreground">
                  {item.product.sku}
                </p>
              )}
              {item.product.variantOptions && (
                <p className="truncate text-[11px] text-muted-foreground">
                  {item.product.variantOptions}
                </p>
              )}
            </div>
            <div className="flex shrink-0 flex-col items-end gap-0.5 text-right">
              <span
                className={cn(
                  'text-sm font-bold tabular-nums',
                  isEntry
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                )}
              >
                {isEntry ? '+' : '-'}
                {item.quantity}
              </span>
              {isSale && (
                <VisibleTo action="movement:view_costs">
                  <span className="text-[11px] text-muted-foreground tabular-nums">
                    {currency.format(item.originalValue || 0)}
                    {item.discount
                      ? ` − ${currency.format(item.discount)}`
                      : ''}
                  </span>
                </VisibleTo>
              )}
              <VisibleTo action="movement:view_costs">
                <span className="text-xs font-medium tabular-nums">
                  {currency.format(itemValue)}
                </span>
              </VisibleTo>
            </div>
          </div>
        );
      })}
    </div>
  );
}

interface MovementCardProps {
  movement: Movement;
}

export function MovementCard({ movement }: MovementCardProps) {
  const [expanded, setExpanded] = useState(false);

  const isEntry = movement.type === 'entry';
  const date = movement.executedAt || movement.createdAt;

  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <button
        type="button"
        className="flex w-full flex-col gap-2 p-3 text-left"
        onClick={() => setExpanded((prev) => !prev)}
        aria-expanded={expanded}
      >
        <div className="flex items-center justify-between b gap-2">
          <span className="flex min-w-0 items-center gap-2">
            <Badge
              variant="outline"
              className={cn(
                'shrink-0',
                isEntry
                  ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900'
                  : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900'
              )}
            >
              {isEntry ? (
                <ArrowUp className="h-3 w-3" />
              ) : (
                <ArrowDown className="h-3 w-3" />
              )}
              {isEntry ? 'Entrada' : 'Saída'}
            </Badge>
            <span className="truncate text-sm font-medium">
              {movement.reason || 'Sem motivo'}
            </span>
          </span>
          <div
            className={cn(
              'flex w-6 h-6 items-center justify-center rounded-md border',
              expanded && 'bg-sidebar'
            )}
          >
            <ChevronRight
              className={cn(
                'h-4 w-4 shrink-0 text-muted-foreground transition-transform',
                expanded && 'rotate-90'
              )}
            />
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span>{format(date, "dd/MM/yyyy '·' HH:mm", { locale: ptBR })}</span>
          <span>·</span>
          <span>
            {movement.items.length}{' '}
            {movement.items.length === 1 ? 'produto' : 'produtos'}
          </span>
        </div>

        <Separator className="my-1.5 h-[0.5px]" />
        {movement.documentNumber && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <FileText className="h-3 w-3" />
            {movement.documentNumber}
          </div>
        )}

        <div className="flex items-center justify-between gap-2 pt-1">
          <span
            className={cn(
              'flex items-baseline gap-1 font-bold tabular-nums',
              isEntry
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-600 dark:text-red-400'
            )}
          >
            {isEntry ? '+' : '-'}
            {movement.totalQuantity}
            <span className="text-xs font-normal text-muted-foreground">
              un.
            </span>
          </span>
          <span className="flex items-center gap-2.5">
            <VisibleTo action="movement:view_costs">
              <span className="text-sm font-medium text-foreground">
                {currency.format(movement.totalValue || 0)}
              </span>
            </VisibleTo>
            <MovementCardResponsible user={movement.user} />
          </span>
        </div>
      </button>

      {expanded && <MovementCardItems movement={movement} />}
    </div>
  );
}
