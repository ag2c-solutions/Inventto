import { AlertTriangle } from 'lucide-react';

import type { VariantOption } from '@/features/products';

import { ImageCard } from '@/shared/components/common/image-card';
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/shared/components/ui/dialog';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { useIsMobile } from '@/shared/hooks/use-is-mobile';
import { cn } from '@/shared/utils';

import { ItemAttributeBadge } from '../../../item-attribute-badge';
import { useMovementForm } from '../../hooks';

import { formatMoneyInput } from './format-money';
import { useAddItems } from './use-add-items';

interface ItemRowProps {
  label?: string;
  options?: VariantOption[];
  sku?: string;
  stock: number;
  availableStock: number;
  valueLabel: string;
  value: number | undefined;
  quantity: number;
  invalid: boolean;
  disabled?: boolean;
  onValueChange: (value: string) => void;
  onQuantityChange: (value: string) => void;
}

function ItemRow({
  label,
  options,
  sku,
  stock,
  availableStock,
  valueLabel,
  value,
  quantity,
  invalid,
  disabled,
  onValueChange,
  onQuantityChange
}: ItemRowProps) {
  const isActive = quantity > 0 || invalid;

  return (
    <div
      className={cn(
        'rounded-lg border bg-muted/40 p-3 transition-colors',
        isActive && 'border-border bg-card',
        invalid && 'border-destructive bg-destructive/5',
        disabled && 'opacity-50'
      )}
    >
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          {options?.length ? (
            <div className="flex flex-wrap gap-1">
              {options.map((option) => (
                <ItemAttributeBadge
                  key={`${option.name}-${option.value}`}
                  option={option}
                />
              ))}
            </div>
          ) : (
            <p className="truncate text-sm font-semibold leading-tight">
              {label}
            </p>
          )}
          {sku && (
            <p className="mt-1 truncate font-mono text-[11px] text-muted-foreground">
              {sku}
            </p>
          )}
        </div>
        <span className="shrink-0 whitespace-nowrap text-xs text-muted-foreground">
          Estoque: {stock} un.
        </span>
      </div>

      <div className="mt-2.5 grid grid-cols-[1fr_110px] gap-2">
        <div>
          <Label className="text-[10.5px] font-semibold text-muted-foreground">
            {valueLabel}
          </Label>
          <div className="relative mt-1">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
              R$
            </span>
            <Input
              type="text"
              inputMode="decimal"
              value={formatMoneyInput(value)}
              placeholder="0,00"
              disabled={disabled}
              className={cn('h-9 pl-8', disabled && 'cursor-not-allowed')}
              onChange={(e) => onValueChange(e.target.value)}
            />
          </div>
        </div>
        <div>
          <Label className="text-[10.5px] font-semibold text-muted-foreground">
            Quantidade
          </Label>
          <Input
            type="number"
            min={0}
            value={quantity || ''}
            placeholder="0"
            disabled={disabled}
            className={cn(
              'mt-1 h-9 text-right',
              invalid && 'border-destructive focus-visible:ring-destructive',
              disabled && 'cursor-not-allowed'
            )}
            onChange={(e) => onQuantityChange(e.target.value)}
          />
        </div>
      </div>

      {invalid && (
        <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-destructive">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          Estoque insuficiente — há {availableStock} disponível.
        </p>
      )}
    </div>
  );
}

export function AddItemsDialog() {
  const isMobile = useIsMobile();
  const {
    isDialogOpen,
    form,
    actions,
    selectedProduct,
    editingItem,
    editingIndex
  } = useMovementForm();

  const type = form.watch('type');
  const itemsInBatch = form.watch('items');
  const isWithdrawal = type === 'withdrawal';
  const valueLabel = isWithdrawal ? 'Preço de venda' : 'Custo unitário';

  const existingItems =
    editingIndex !== null
      ? itemsInBatch.filter((_, index) => index !== editingIndex)
      : itemsInBatch;

  const {
    quantities,
    values,
    filledCount,
    invalidKeys,
    getAvailableStock,
    handleQuantityChange,
    handleValueChange,
    handleAdd
  } = useAddItems({
    product: selectedProduct,
    isOpen: isDialogOpen,
    isWithdrawal,
    editingItem,
    existingItems,
    onConfirm: (items) => {
      actions.addItem(items);
    }
  });

  if (!selectedProduct) return null;

  const hasVariants = !!(
    selectedProduct.hasVariants &&
    selectedProduct.variants &&
    selectedProduct.variants.length > 0
  );
  const disableConfirm = filledCount === 0 || invalidKeys.size > 0;

  // Produtos com estoque disponível primeiro; sem estoque ficam por último.
  const sortedVariants = hasVariants
    ? [...selectedProduct.variants!].sort(
        (a, b) =>
          getAvailableStock(b.id, b.stock ?? 0) -
          getAvailableStock(a.id, a.stock ?? 0)
      )
    : [];

  return (
    <Dialog
      open={isDialogOpen}
      onOpenChange={(open) => actions.toggleDialog(open)}
    >
      <DialogContent
        className={cn(
          'flex max-h-[85vh] flex-col gap-0 overflow-hidden p-0',
          isMobile
            ? 'top-auto bottom-0 left-0 right-0 w-full max-w-full translate-x-0 translate-y-0 rounded-t-2xl rounded-b-none data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom'
            : 'sm:max-w-md'
        )}
      >
        {isMobile && (
          <div className="flex justify-center pt-2.5 pb-1">
            <span className="h-1.5 w-10 rounded-full bg-muted-foreground/30" />
          </div>
        )}
        <DialogHeader className="flex-row items-start gap-3 space-y-0 border-b px-5 py-4 text-left">
          <div className="h-11 w-11 shrink-0 overflow-hidden rounded-md border bg-muted">
            <ImageCard
              src={selectedProduct.allImages?.[0]?.url || '/placeholder.svg'}
              alt={selectedProduct.name}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="min-w-0 flex-1 pr-6">
            <DialogTitle className="truncate text-sm font-semibold leading-snug">
              {editingItem ? 'Editar item' : 'Adicionar item'}:{' '}
              {selectedProduct.name}
            </DialogTitle>
            <p className="mt-0.5 truncate font-mono text-xs text-muted-foreground">
              {selectedProduct.sku || '-'}
            </p>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {hasVariants && (
            <p className="mb-2.5 font-mono text-[10px] font-semibold tracking-wide text-muted-foreground/70 uppercase">
              Variantes ({selectedProduct.variants!.length})
            </p>
          )}

          <div className="flex flex-col gap-2.5">
            {hasVariants
              ? sortedVariants.map((variant) => {
                  const stock = variant.stock ?? 0;
                  const availableStock = getAvailableStock(variant.id, stock);
                  const outOfStock = isWithdrawal && availableStock <= 0;

                  return (
                    <ItemRow
                      key={variant.id}
                      label={variant.options?.length ? undefined : 'Padrão'}
                      options={variant.options}
                      sku={variant.sku}
                      stock={stock}
                      availableStock={availableStock}
                      valueLabel={valueLabel}
                      value={values[variant.id]}
                      quantity={quantities[variant.id] || 0}
                      invalid={invalidKeys.has(variant.id)}
                      disabled={outOfStock}
                      onValueChange={(value) =>
                        handleValueChange(variant.id, value)
                      }
                      onQuantityChange={(value) =>
                        handleQuantityChange(variant.id, value)
                      }
                    />
                  );
                })
              : (() => {
                  const stock = selectedProduct.stock ?? 0;
                  const availableStock = getAvailableStock(null, stock);
                  const outOfStock = isWithdrawal && availableStock <= 0;

                  return (
                    <ItemRow
                      label="Produto sem variações"
                      sku={selectedProduct.sku}
                      stock={stock}
                      availableStock={availableStock}
                      valueLabel={valueLabel}
                      value={values[selectedProduct.id]}
                      quantity={quantities[selectedProduct.id] || 0}
                      invalid={invalidKeys.has(selectedProduct.id)}
                      disabled={outOfStock}
                      onValueChange={(value) =>
                        handleValueChange(selectedProduct.id, value)
                      }
                      onQuantityChange={(value) =>
                        handleQuantityChange(selectedProduct.id, value)
                      }
                    />
                  );
                })()}
          </div>
        </div>

        <DialogFooter className="flex-row items-center justify-between gap-3 border-t bg-muted/30 px-5 py-3.5 sm:justify-between">
          <span className="text-xs whitespace-nowrap text-muted-foreground">
            Total de itens:{' '}
            <span className="font-semibold text-foreground">{filledCount}</span>
          </span>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => actions.toggleDialog(false)}
            >
              Cancelar
            </Button>
            <Button type="button" onClick={handleAdd} disabled={disableConfirm}>
              Confirmar
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
