import { Link } from 'react-router';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ArrowDownLeft, ArrowLeftRight, ArrowUpRight } from 'lucide-react';

import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { cn } from '@/shared/utils';

import type { RecentMovement } from '../../../domain/entities';

interface MovesCardProps {
  movements: RecentMovement[];
}

export function MovesCard({ movements }: MovesCardProps) {
  return (
    <Card className="gap-0 overflow-hidden py-0">
      <div className="flex items-center gap-2 border-b px-4 py-3">
        <ArrowLeftRight className="size-3.5 text-muted-foreground" />
        <h3 className="text-xs font-semibold tracking-wide uppercase">
          Movimentações recentes
        </h3>
        <Button
          asChild
          variant="outline"
          size="sm"
          className="ml-auto h-7 rounded-full px-3 text-xs"
        >
          <Link to="/movements">Ver histórico</Link>
        </Button>
      </div>

      {movements.length === 0 ? (
        <p className="p-4 text-sm text-muted-foreground">
          Nenhuma movimentação recente.
        </p>
      ) : (
        <ul>
          {movements.map((movement) => {
            const isEntry = movement.type === 'entry';
            const Icon = isEntry ? ArrowUpRight : ArrowDownLeft;

            return (
              <li
                key={movement.id}
                className="flex items-center gap-3 border-b px-4 py-3 last:border-b-0"
              >
                <span
                  className={cn(
                    'flex size-8 shrink-0 items-center justify-center rounded-md border',
                    isEntry
                      ? 'border-[var(--status-healthy)]/30 bg-[var(--status-healthy-soft)] text-[var(--status-healthy)]'
                      : 'border-[var(--status-critical)]/30 bg-[var(--status-critical-soft)] text-[var(--status-critical)]'
                  )}
                >
                  <Icon className="size-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">
                    {isEntry ? 'Entrada' : 'Saída'} · {movement.reason}
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    {movement.itemsCount}{' '}
                    {movement.itemsCount === 1 ? 'item' : 'itens'} ·{' '}
                    {formatDistanceToNow(movement.executedAt, {
                      addSuffix: true,
                      locale: ptBR
                    })}
                  </span>
                </span>
                <span
                  className={cn(
                    'shrink-0 font-mono text-sm font-bold',
                    isEntry
                      ? 'text-[var(--status-healthy)]'
                      : 'text-[var(--status-critical)]'
                  )}
                >
                  {isEntry ? '+' : '−'}
                  {movement.totalQuantity}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
