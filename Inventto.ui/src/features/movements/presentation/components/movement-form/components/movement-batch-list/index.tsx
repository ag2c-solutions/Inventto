import { useState } from 'react';
import { AlertTriangle, Pencil, X } from 'lucide-react';

import { ColorBadge } from '@/shared/components/common/color-badge';
import { ImageCard } from '@/shared/components/common/image-card';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/shared/components/ui/table';
import { cn } from '@/shared/utils';

import { useMovementForm } from '../../hooks';

const currency = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL'
});

function ItemAttributeBadge({
  option
}: {
  option: { name: string; value: string };
}) {
  return option.value.includes('#') ? (
    <ColorBadge color={option.value} />
  ) : (
    <Badge variant="secondary" className="text-xs font-normal">
      {option.value}
    </Badge>
  );
}

export function MovementBatchList() {
  const { form, actions } = useMovementForm();
  const type = form.watch('type');
  const items = form.watch('items');
  const [removingIndex, setRemovingIndex] = useState<number | null>(null);

  if (!items || items.length === 0) return null;

  const isOut = type === 'withdrawal';
  const totalLabel = isOut ? 'Valor total' : 'Custo total';

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
