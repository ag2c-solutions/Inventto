import { memo } from 'react';

import { ImageCard } from '@/shared/components/common/image-card';
import { cn } from '@/shared/utils';

import { VisibleTo } from '@/features/permissions';

import type { Movement, MovementItem } from '../../../domain/entities';

type ItemsListProps = {
  data: MovementItem[];
  parentData: Movement;
};

function ItemsListComponent({ data, parentData }: ItemsListProps) {
  const isSale = !!parentData.reason?.toLowerCase().includes('venda');

  // Base grid layout
  const gridTemplate = isSale
    ? 'grid-cols-[1fr_100px_120px_120px_120px_100px]' // If sale: product, qty, original, discount, net, unit cost
    : 'grid-cols-[1fr_100px_100px]'; // Normal: product, qty, cost

  const GRID = cn('grid items-center gap-8', gridTemplate);

  return (
    <div className="flex flex-col rounded-md border bg-background">
      <div
        className={cn(
          GRID,
          'border-b bg-muted/30 px-6 py-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground'
        )}
      >
        <span>Produto</span>
        <span className="text-center">Quantidade</span>
        {isSale ? (
          <>
            <span className="text-right">Valor Original</span>
            <span className="text-right">Desconto</span>
            <span className="text-right">Valor Líquido</span>
          </>
        ) : null}
        <VisibleTo action="movement:view_costs">
          <span className="text-right">Valor</span>
        </VisibleTo>
      </div>

      {data.map((item) => (
        <div
          key={item.id}
          className={cn(GRID, 'border-b px-6 py-4 last:border-b-0')}
        >
          {/* PRODUTO */}
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10 overflow-hidden rounded-md border bg-muted flex-shrink-0">
              <ImageCard
                src={item.product.imageUrl || '/placeholder.svg'}
                alt={item.product.name}
              />
            </div>
            <div className="flex flex-col">
              <span
                className="font-medium text-foreground truncate max-w-[300px]"
                title={item.product.name}
              >
                {item.product.name}
              </span>
              {item.product.sku && (
                <span className="text-[13px] text-muted-foreground/80 mt-0.5 font-mono">
                  {item.product.sku}
                </span>
              )}
              {item.product.variantOptions && (
                <div className="flex items-center text-[13px] text-muted-foreground/80 mt-0.5">
                  <span>{item.product.variantOptions}</span>
                </div>
              )}
            </div>
          </div>

          {/* QUANTIDADE */}
          <div className="flex flex-col text-center">
            <span
              className={cn(
                'font-bold tabular-nums',
                parentData.type === 'entry' &&
                  'text-green-600 dark:text-green-400',
                parentData.type === 'withdrawal' &&
                  'text-red-600 dark:text-red-400'
              )}
            >
              {parentData.type === 'entry' ? '+' : '-'} {item.quantity}
            </span>
            <span className="text-xs text-muted-foreground">unidades</span>
          </div>

          {/* VALOR PARA VENDA */}
          {isSale && (
            <>
              <span className="text-right text-sm text-muted-foreground tabular-nums">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                }).format(item.originalValue || 0)}
              </span>
              <span className="text-right text-sm text-muted-foreground tabular-nums">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                }).format(item.discount || 0)}
              </span>
              <span className="text-right text-sm font-medium text-foreground tabular-nums">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                }).format(item.netValue || 0)}
              </span>
            </>
          )}

          {/* VALOR (CUSTO) */}
          <VisibleTo action="movement:view_costs">
            <span className="text-right text-sm text-muted-foreground tabular-nums">
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              }).format(item.unitCost * item.quantity)}
            </span>
          </VisibleTo>
        </div>
      ))}
    </div>
  );
}

export const ItemsList = memo(ItemsListComponent);
