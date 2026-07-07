import { useState } from 'react';

import {
  Avatar,
  AvatarFallback,
  AvatarImage
} from '@/shared/components/ui/avatar';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Checkbox } from '@/shared/components/ui/checkbox';
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

import { ActionButton } from '@/features/permissions';

import { useAddProductsSheet } from './hooks/use-add-products-sheet';

interface AddProductsSheetProps {
  catalogId: string;
}

export function AddProductsSheet({ catalogId }: AddProductsSheetProps) {
  const [open, setOpen] = useState(false);
  const {
    search,
    setSearch,
    products,
    isLoading,
    selectedIds,
    selectedCount,
    toggleProduct,
    confirmSelection,
    isConfirming
  } = useAddProductsSheet(catalogId);

  async function handleConfirm() {
    await confirmSelection();
    setOpen(false);
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <ActionButton action="catalog:manage">Adicionar produtos</ActionButton>
      </SheetTrigger>
      <SheetContent className="flex flex-col gap-0 p-0 sm:max-w-lg overflow-hidden">
        <SheetHeader className="border-b">
          <SheetTitle>Adicionar produtos</SheetTitle>
        </SheetHeader>

        <div className="p-4">
          <Input
            placeholder="Buscar produto ou SKU"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex-1 overflow-y-auto px-4 flex flex-col gap-2">
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
              <label
                key={product.id}
                className="flex items-center gap-3 rounded-md border p-2 cursor-pointer has-disabled:cursor-not-allowed has-disabled:opacity-60"
              >
                <Checkbox
                  checked={product.alreadyAdded || selectedIds.has(product.id)}
                  disabled={product.alreadyAdded}
                  onCheckedChange={() => toggleProduct(product.id)}
                />

                <Avatar className="h-9 w-9 rounded-md">
                  {product.imageUrl && (
                    <AvatarImage
                      src={product.imageUrl}
                      alt={product.name}
                      className="object-cover"
                    />
                  )}
                  <AvatarFallback className="rounded-md text-[10px]">
                    IMG
                  </AvatarFallback>
                </Avatar>

                <div className="flex flex-col flex-1 min-w-0">
                  <span className="text-sm font-medium truncate">
                    {product.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {product.sku}
                  </span>
                </div>

                {product.alreadyAdded && (
                  <Badge variant="secondary">Já adicionado</Badge>
                )}
              </label>
            ))
          )}
        </div>

        <SheetFooter className="flex-row items-center justify-between border-t">
          <span className="text-sm text-muted-foreground">
            {selectedCount} selecionados
          </span>
          <Button
            type="button"
            disabled={selectedCount === 0 || isConfirming}
            onClick={handleConfirm}
          >
            Adicionar ao catálogo
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
