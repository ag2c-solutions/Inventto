import { useState } from 'react';
import { Plus } from 'lucide-react';

import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from '@/shared/components/ui/sheet';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { useIsMobile } from '@/shared/hooks/use-is-mobile';
import { cn } from '@/shared/utils';

import { ActionButton } from '@/features/permissions';

import { ConfigurePricesDialog } from '../configure-prices';

import { useAddProducts } from './hooks/use-add-products';
import { ProductSelectionItem } from './pieces/product-selection-item';

interface AddProductsSheetProps {
  catalogId: string;
  /** Gatilho compacto (só o ícone Plus) — usado no cabeçalho mobile. */
  iconOnly?: boolean;
}

export function AddProductsSheet({
  catalogId,
  iconOnly = false
}: AddProductsSheetProps) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [configureOpen, setConfigureOpen] = useState(false);
  const isMobile = useIsMobile();

  const {
    search,
    products,
    isLoading,
    selectedIds,
    selectedProducts,
    selectedCount,
    setSearch,
    toggleProduct
  } = useAddProducts(catalogId);

  function handleConfigureClick() {
    setConfigureOpen(true);
  }

  function handleBack() {
    setConfigureOpen(false);
  }

  function handleSuccess() {
    setConfigureOpen(false);
    setSheetOpen(false);
  }

  return (
    <>
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetTrigger asChild>
          <ActionButton
            action="catalog:manage"
            aria-label="Adicionar produtos"
            className={iconOnly ? 'size-9 p-0' : undefined}
          >
            {iconOnly ? <Plus className="h-4 w-4" /> : 'Adicionar produtos'}
          </ActionButton>
        </SheetTrigger>
        <SheetContent
          side={isMobile ? 'bottom' : 'right'}
          className={cn(
            'flex flex-col gap-0 p-0 overflow-hidden',
            isMobile ? 'max-h-[85vh] rounded-t-lg' : 'sm:max-w-lg'
          )}
        >
          <SheetHeader className="border-b">
            <SheetTitle>Adicionar produtos</SheetTitle>
            <p className="text-sm text-muted-foreground px-6 pb-3">
              Selecione os produtos e depois configure os preços.
            </p>
          </SheetHeader>

          <div className="p-4">
            <Input
              placeholder="Buscar produto ou SKU"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto px-4 flex flex-col gap-2">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-14 w-full rounded-md" />
              ))
            ) : products.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Nenhum produto encontrado.
              </p>
            ) : (
              products.map((product) => (
                <ProductSelectionItem
                  key={product.id}
                  product={product}
                  isSelected={selectedIds.has(product.id)}
                  onToggle={toggleProduct}
                />
              ))
            )}
          </div>

          <SheetFooter className="flex-row items-center justify-between border-t">
            <span className="text-sm text-muted-foreground">
              {selectedCount} selecionados
            </span>
            <Button
              type="button"
              disabled={selectedCount === 0}
              onClick={handleConfigureClick}
            >
              Configurar {selectedCount > 0 ? selectedCount : ''} →
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Dialog de configuração de preços — aberto sobre o Sheet */}
      <ConfigurePricesDialog
        open={configureOpen}
        onOpenChange={setConfigureOpen}
        catalogId={catalogId}
        products={selectedProducts}
        onSuccess={handleSuccess}
        onBack={handleBack}
      />
    </>
  );
}
