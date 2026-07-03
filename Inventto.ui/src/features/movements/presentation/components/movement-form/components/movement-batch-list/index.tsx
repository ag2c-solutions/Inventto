import { useState } from 'react';
import { AlertTriangle, Pencil, X } from 'lucide-react';

import { ImageCard } from '@/shared/components/common/image-card';
import { Button } from '@/shared/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/shared/components/ui/table';
import { useIsMobile } from '@/shared/hooks/use-is-mobile';
import { cn } from '@/shared/utils';

import { ItemAttributeBadge } from '../../../item-attribute-badge';
import { useMovementForm } from '../../hooks';

const currency = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL'
});

export function MovementBatchList() {
  const { form, actions } = useMovementForm();
  const type = form.watch('type');
  const items = form.watch('items');
  const [removingIndex, setRemovingIndex] = useState<number | null>(null);
  const isMobile = useIsMobile();

  if (!items || items.length === 0) return null;

  const isOut = type === 'withdrawal';
  const totalLabel = isOut ? 'Valor total' : 'Custo total';

  if (isMobile) {
    return (
      <div className="flex flex-col gap-2.5">
        {items.map((item, index) => {
          const insufficientStock = isOut && item.quantity > item.currentStock;
          const isRemoving = removingIndex === index;
          const unitValue = isOut ? item.unitPrice : item.unitCost;

          return (
            <div
              key={`${item.productId}-${item.variantId || 'simple'}-${index}`}
              className={cn(
                'relative overflow-hidden rounded-lg border p-3',
                insufficientStock && 'border-destructive bg-destructive/5'
              )}
            >
              <div className="flex items-start gap-3 pr-14">
                <div className="h-9 w-9 shrink-0 rounded-md overflow-hidden border bg-muted">
                  {item.productImage && (
                    <ImageCard
                      src={item.productImage}
                      alt={item.productName}
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
                <div className="flex min-w-0 flex-col gap-0.5">
                  <span className="truncate text-sm font-medium">
                    {item.productName}
                  </span>
                  {item.sku && (
                    <span className="truncate font-mono text-xs text-muted-foreground">
                      {item.sku}
                    </span>
                  )}
                  {item.variantOptions && item.variantOptions.length > 0 && (
                    <div className="mt-0.5 flex flex-wrap gap-1">
                      {item.variantOptions.map((option) => (
                        <ItemAttributeBadge
                          key={`${option.name}-${option.value}`}
                          option={option}
                        />
                      ))}
                    </div>
                  )}
                  {insufficientStock && (
                    <span className="mt-0.5 flex items-center gap-1 text-xs font-medium text-destructive">
                      <AlertTriangle className="h-3 w-3" />
                      Estoque insuficiente — há {item.currentStock} disponível.
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-2.5 flex items-center justify-between gap-2 border-t pt-2.5">
                <span className="flex flex-col">
                  <span className="text-[10px] font-semibold uppercase text-muted-foreground">
                    Qtd.
                  </span>
                  <span
                    className={cn(
                      'font-bold tabular-nums',
                      isOut
                        ? insufficientStock
                          ? 'text-destructive'
                          : 'text-red-600 dark:text-red-400'
                        : 'text-green-600 dark:text-green-400'
                    )}
                  >
                    {item.quantity}
                  </span>
                </span>
                <span className="flex flex-col items-end">
                  <span className="text-[10px] font-semibold uppercase text-muted-foreground">
                    {totalLabel}
                  </span>
                  <span className="font-medium">
                    {currency.format(unitValue * item.quantity)}
                  </span>
                </span>
              </div>

              {!isRemoving && (
                <div className="absolute right-2 top-2 flex gap-1">
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    className="h-7 w-7 bg-background"
                    aria-label="Editar item"
                    onClick={() => actions.editItem(index)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    className="h-7 w-7 bg-background text-destructive hover:text-destructive"
                    aria-label="Remover item"
                    onClick={() => setRemovingIndex(index)}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )}

              {isRemoving && (
                <div className="absolute inset-0 flex items-center justify-center gap-2 bg-background/95 backdrop-blur-[1px]">
                  <span className="text-sm font-medium">
                    Remover este item?
                  </span>
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    onClick={() => {
                      actions.removeItem(index);
                      setRemovingIndex(null);
                    }}
                  >
                    Remover
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setRemovingIndex(null)}
                  >
                    Manter
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="rounded-lg border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Produto</TableHead>
            <TableHead className="text-right">Qtd.</TableHead>
            <TableHead className="text-right">{totalLabel}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item, index) => {
            const insufficientStock =
              isOut && item.quantity > item.currentStock;
            const isRemoving = removingIndex === index;
            const unitValue = isOut ? item.unitPrice : item.unitCost;

            return (
              <TableRow
                key={`${item.productId}-${item.variantId || 'simple'}-${index}`}
                className={cn(
                  'group relative',
                  insufficientStock && 'bg-destructive/5'
                )}
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 shrink-0 rounded-md overflow-hidden border bg-muted">
                      {item.productImage && (
                        <ImageCard
                          src={item.productImage}
                          alt={item.productName}
                          className="h-full w-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex flex-col min-w-0 gap-0.5">
                      <span className="text-sm font-medium truncate">
                        {item.productName}
                      </span>
                      {item.sku && (
                        <span className="text-xs text-muted-foreground font-mono truncate">
                          {item.sku}
                        </span>
                      )}
                      {item.variantOptions &&
                        item.variantOptions.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-0.5">
                            {item.variantOptions.map((option) => (
                              <ItemAttributeBadge
                                key={`${option.name}-${option.value}`}
                                option={option}
                              />
                            ))}
                          </div>
                        )}
                      {insufficientStock && (
                        <span className="flex items-center gap-1 text-xs font-medium text-destructive mt-0.5">
                          <AlertTriangle className="h-3 w-3" />
                          Estoque insuficiente — há {item.currentStock}{' '}
                          disponível.
                        </span>
                      )}
                    </div>
                  </div>

                  <div
                    className={cn(
                      'absolute inset-0 hidden items-center justify-center gap-2 bg-background/85 backdrop-blur-[1px]',
                      isRemoving ? 'flex' : 'group-hover:flex'
                    )}
                  >
                    {isRemoving ? (
                      <>
                        <span className="text-sm font-medium">
                          Remover este item?
                        </span>
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            actions.removeItem(index);
                            setRemovingIndex(null);
                          }}
                        >
                          Remover
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => setRemovingIndex(null)}
                        >
                          Manter
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="gap-1.5"
                          onClick={() => actions.editItem(index)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Editar
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="gap-1.5 text-destructive hover:text-destructive"
                          onClick={() => setRemovingIndex(index)}
                        >
                          <X className="h-3.5 w-3.5" />
                          Remover
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>

                <TableCell className="text-right">
                  <span
                    className={cn(
                      'font-bold tabular-nums',
                      isOut
                        ? insufficientStock
                          ? 'text-destructive'
                          : 'text-red-600 dark:text-red-400'
                        : 'text-green-600 dark:text-green-400'
                    )}
                  >
                    {item.quantity}
                  </span>
                </TableCell>

                <TableCell className="text-right whitespace-nowrap font-medium">
                  {currency.format(unitValue * item.quantity)}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
