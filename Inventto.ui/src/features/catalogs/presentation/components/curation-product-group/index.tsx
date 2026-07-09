import { useState } from 'react';
import { ChevronDown, ChevronUp, Pencil, Trash2 } from 'lucide-react';

import { ImageCard } from '@/shared/components/common/image-card';
import {
  Avatar,
  AvatarFallback,
  AvatarImage
} from '@/shared/components/ui/avatar';
import { Button } from '@/shared/components/ui/button';
import { useIsMobile } from '@/shared/hooks/use-is-mobile';
import { cn, formatIntegerToDecimal } from '@/shared/utils';
import { formatCurrency } from '@/shared/utils/formatters/format-currency';

import { usePermission } from '@/features/permissions';
import { VariantOptionBadge } from '@/features/products';

import type { CatalogItem } from '../../../domain/entities';
import { useRemoveCatalogProductMutation } from '../../hooks/use-mutations';
import type { AvailableProduct } from '../../hooks/use-queries';
import { ConfigurePricesDialog } from '../actions/configure-prices';

export interface CurationProductGroupProps {
  items: CatalogItem[];
  product: AvailableProduct;
  catalogId: string;
}

export function CurationProductGroup({
  items,
  product,
  catalogId
}: CurationProductGroupProps) {
  const isMobile = useIsMobile();
  const { can } = usePermission();
  const readOnly = !can('catalog:manage');

  const [isOpen, setIsOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const { mutate: removeProduct, isPending: isRemoving } =
    useRemoveCatalogProductMutation();

  const representative = items[0];
  const hasVariants = items.length > 1 || !!representative?.variantId;
  const allHavePrice = items.every((i) => i.price > 0);
  const needsPrice = !allHavePrice;

  function handleRemove() {
    removeProduct(items);
  }

  return (
    <>
      <div
        className={cn(
          'rounded-lg border bg-card transition-colors overflow-hidden',
          needsPrice && 'border-amber-400 bg-amber-50/30 dark:bg-amber-950/10'
        )}
      >
        <button
          type="button"
          className="w-full flex items-center gap-3 p-3 text-left hover:bg-muted/40 transition-colors"
          onClick={() => setIsOpen((prev) => !prev)}
        >
          <span
            className={cn(
              'size-2 rounded-full flex-shrink-0',
              allHavePrice ? 'bg-emerald-500' : 'bg-amber-400'
            )}
          />

          <Avatar className="h-11 w-11 rounded-md flex-shrink-0">
            {representative?.product.imageUrl && (
              <AvatarImage
                src={representative.product.imageUrl}
                alt={representative.product.name}
                className="object-cover"
              />
            )}
            <AvatarFallback className="rounded-md text-[10px]">
              IMG
            </AvatarFallback>
          </Avatar>

          <div className="flex flex-col flex-1 min-w-0">
            <span className="text-sm font-medium truncate">
              {representative?.product.name}
            </span>
            <span className="text-xs text-muted-foreground">
              {representative?.product.sku}
              {hasVariants && ` · ${items.length} variante(s)`}
            </span>
            {needsPrice && (
              <span className="text-xs text-amber-600 dark:text-amber-500">
                Itens sem preço definido.
              </span>
            )}
          </div>

          {/* Preço resumido inline (desktop); no mobile os preços ficam
              empilhados abaixo do cabeçalho. */}
          {!hasVariants && !isMobile && representative && (
            <span className="text-sm font-medium text-foreground shrink-0">
              {representative.price > 0
                ? formatCurrency(formatIntegerToDecimal(representative.price))
                : '—'}
            </span>
          )}

          {!readOnly && (
            <div
              className="flex items-center gap-1"
              onClick={(e) => e.stopPropagation()}
            >
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                title="Editar preços"
                onClick={() => setEditOpen(true)}
              >
                <Pencil className="h-4 w-4" />
                <span className="sr-only">Editar preços</span>
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                title="Remover produto"
                className="hover:text-destructive"
                disabled={isRemoving}
                onClick={handleRemove}
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Remover produto</span>
              </Button>
            </div>
          )}

          {hasVariants &&
            (isOpen ? (
              <ChevronUp className="size-4 text-muted-foreground flex-shrink-0" />
            ) : (
              <ChevronDown className="size-4 text-muted-foreground flex-shrink-0" />
            ))}
        </button>

        {/* Mobile: preços de venda/original empilhados abaixo do cabeçalho */}
        {isMobile && !hasVariants && representative && (
          <div className="border-t px-3 py-2 flex flex-col gap-1 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Preço</span>
              <span
                className={cn(
                  'font-medium',
                  representative.price <= 0 && 'text-amber-600'
                )}
              >
                {representative.price > 0
                  ? formatCurrency(formatIntegerToDecimal(representative.price))
                  : 'Sem preço'}
              </span>
            </div>
            {representative.originalPrice != null &&
              representative.originalPrice > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Original
                  </span>
                  <span className="text-muted-foreground line-through">
                    {formatCurrency(
                      formatIntegerToDecimal(representative.originalPrice)
                    )}
                  </span>
                </div>
              )}
          </div>
        )}

        {/* Lista de variantes — somente leitura */}
        {hasVariants && isOpen && (
          <div className="border-t divide-y">
            {items.map((item) => (
              <div
                key={item.id}
                data-testid="variant-row"
                className={cn(
                  'flex gap-3 px-3 py-2 text-sm',
                  isMobile ? 'flex-col' : 'items-center'
                )}
              >
                {item.variant && (
                  <span className="pl-5 flex items-center gap-3 flex-1 text-muted-foreground">
                    <div className="w-11 h-11 shrink-0 rounded-md border overflow-hidden">
                      <ImageCard
                        alt={item.product.name}
                        src={
                          product.variants.find((v) => v.id === item.variantId)
                            ?.imageUrl ??
                          item.product.imageUrl ??
                          ''
                        }
                      />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <div className="flex gap-1">
                        {item.variant.options.map((o, idx) => (
                          <VariantOptionBadge key={idx} option={o} />
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground/60">
                        {item.variant.sku}
                      </span>
                    </div>
                  </span>
                )}
                <div
                  className={cn(
                    'flex shrink-0',
                    isMobile
                      ? 'flex-col gap-1 pl-5'
                      : 'items-center gap-3 ml-auto'
                  )}
                >
                  <div
                    className={cn(
                      'flex',
                      isMobile
                        ? 'items-center justify-between'
                        : 'flex-col items-end'
                    )}
                  >
                    <span className="text-xs text-muted-foreground">Preço</span>
                    <span
                      className={cn(
                        'font-medium',
                        item.price <= 0 && 'text-amber-600'
                      )}
                    >
                      {item.price > 0
                        ? formatCurrency(formatIntegerToDecimal(item.price))
                        : 'Sem preço'}
                    </span>
                  </div>
                  {item.originalPrice != null && item.originalPrice > 0 && (
                    <div
                      className={cn(
                        'flex',
                        isMobile
                          ? 'items-center justify-between'
                          : 'flex-col items-end'
                      )}
                    >
                      <span className="text-xs text-muted-foreground">
                        Original
                      </span>
                      <span className="text-muted-foreground line-through">
                        {formatCurrency(
                          formatIntegerToDecimal(item.originalPrice)
                        )}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {!readOnly && (
        <ConfigurePricesDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          catalogId={catalogId}
          products={[product]}
          existingItems={items}
          mode="edit"
          onSuccess={() => setEditOpen(false)}
          onBack={() => setEditOpen(false)}
        />
      )}
    </>
  );
}
