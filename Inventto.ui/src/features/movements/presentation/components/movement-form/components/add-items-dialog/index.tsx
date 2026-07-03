import { VariantOptionBadge } from '@/features/products';

import { ImageCard } from '@/shared/components/common/image-card';
import { Badge } from '@/shared/components/ui/badge';
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
import { cn } from '@/shared/utils';

import { useMovementForm } from '../../hooks';
import { getMovementItemImage } from '../../utils';

import { useAddItems } from './use-add-items';

export function AddItemsDialog() {
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
    totalQuantity,
    getExistingQty,
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

  const hasVariants =
    selectedProduct.hasVariants &&
    selectedProduct.variants &&
    selectedProduct.variants.length > 0;

  return (
    <Dialog
      open={isDialogOpen}
      onOpenChange={(open) => actions.toggleDialog(open)}
    >
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {editingItem ? 'Editar item' : 'Adicionar item'}:{' '}
            {selectedProduct.name}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-4 overflow-y-auto">
          <div className="flex gap-4 items-start pb-4 border-b">
            <div className="h-20 w-20 shrink-0 border rounded-md overflow-hidden bg-muted">
              <ImageCard
                src={selectedProduct.allImages?.[0]?.url || '/placeholder.svg'}
                alt={selectedProduct.name}
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <h3 className="font-semibold">{selectedProduct.name}</h3>
              <p className="text-sm text-muted-foreground">
                SKU: {selectedProduct.sku || '-'}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <Label className="text-base">
              {hasVariants
                ? 'Selecione as quantidades por variação:'
                : 'Defina a quantidade:'}
            </Label>

            <div className="grid gap-3">
              {hasVariants
                ? selectedProduct.variants!.map((variant) => {
                    const stock = variant.stock ?? 0;
                    const qty = quantities[variant.id] || 0;
                    const variantImg = getMovementItemImage(
                      selectedProduct,
                      variant.id
                    );

                    const qtyInBatch = getExistingQty(variant.id);
                    const availableStock = Math.max(0, stock - qtyInBatch);
                    const isFullyAdded = isWithdrawal && availableStock === 0;

                    return (
                      <div
                        key={variant.id}
                        className={cn(
                          'flex flex-col gap-3 p-3 rounded-lg border bg-card',
                          isFullyAdded && 'opacity-60 bg-muted/50'
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 shrink-0 rounded border overflow-hidden">
                            <ImageCard
                              src={variantImg}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap gap-1 mb-1">
                              {variant.options ? (
                                variant.options.map((option) => (
                                  <VariantOptionBadge
                                    key={option.value}
                                    option={option}
                                  />
                                ))
                              ) : (
                                <span className="text-sm text-muted-foreground">
                                  Padrão
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              <Badge
                                variant="secondary"
                                className="text-[10px] h-5 px-1.5"
                              >
                                Estoque: {stock}
                              </Badge>
                              {isWithdrawal && qtyInBatch > 0 && (
                                <span className="text-[10px] text-orange-600 font-medium">
                                  (-{qtyInBatch} no lote)
                                </span>
                              )}
                              <span className="text-[10px] text-muted-foreground">
                                SKU: {variant.sku}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-[1fr_110px] gap-2">
                          <div>
                            <Label className="text-[11px] text-muted-foreground">
                              {valueLabel}
                            </Label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                                R$
                              </span>
                              <Input
                                type="number"
                                min={0}
                                step="0.01"
                                value={values[variant.id] ?? ''}
                                placeholder="0,00"
                                className="pl-8"
                                onChange={(e) =>
                                  handleValueChange(variant.id, e.target.value)
                                }
                              />
                            </div>
                          </div>
                          <div>
                            <Label className="text-[11px] text-muted-foreground">
                              Quantidade
                            </Label>
                            <Input
                              type="number"
                              min={0}
                              max={isWithdrawal ? availableStock : undefined}
                              value={qty || ''}
                              placeholder={isFullyAdded ? '0' : '0'}
                              disabled={isFullyAdded}
                              className={cn(
                                'text-right',
                                isFullyAdded && 'cursor-not-allowed bg-muted'
                              )}
                              onChange={(e) =>
                                handleQuantityChange(
                                  variant.id,
                                  e.target.value,
                                  stock
                                )
                              }
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })
                : (() => {
                    const stock = selectedProduct.stock ?? 0;
                    const qtyInBatch = getExistingQty(null);
                    const availableStock = Math.max(0, stock - qtyInBatch);
                    const isFullyAdded = isWithdrawal && availableStock === 0;

                    return (
                      <div className="flex flex-col gap-3 p-4 rounded-lg border bg-card">
                        <div className="flex gap-2 text-sm text-muted-foreground">
                          <span>Estoque: {stock}</span>
                          {isWithdrawal && qtyInBatch > 0 && (
                            <span className="text-orange-600">
                              (Já adicionado: {qtyInBatch})
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label className="text-[11px] text-muted-foreground">
                              {valueLabel}
                            </Label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                                R$
                              </span>
                              <Input
                                type="number"
                                min={0}
                                step="0.01"
                                value={values[selectedProduct.id] ?? ''}
                                placeholder="0,00"
                                className="pl-8"
                                onChange={(e) =>
                                  handleValueChange(
                                    selectedProduct.id,
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                          </div>
                          <div>
                            <Label className="text-[11px] text-muted-foreground">
                              Quantidade
                            </Label>
                            <Input
                              type="number"
                              min={0}
                              max={isWithdrawal ? availableStock : undefined}
                              value={quantities[selectedProduct.id] || ''}
                              disabled={isFullyAdded}
                              placeholder="0"
                              className="text-right"
                              onChange={(e) =>
                                handleQuantityChange(
                                  selectedProduct.id,
                                  e.target.value,
                                  stock
                                )
                              }
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })()}
            </div>
          </div>
        </div>

        <DialogFooter className="flex items-center justify-between sm:justify-between gap-4">
          <div className="text-sm font-medium text-muted-foreground">
            Total de itens:{' '}
            <span className="text-foreground">{totalQuantity}</span>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => actions.toggleDialog(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleAdd}
              disabled={totalQuantity <= 0}
              className={cn(
                type === 'entry' && 'bg-green-600 hover:bg-green-700',
                type === 'withdrawal' && 'bg-red-600 hover:bg-red-700'
              )}
            >
              Confirmar
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
