import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/shared/components/ui/dialog';
import { Progress } from '@/shared/components/ui/progress';
import { ScrollArea } from '@/shared/components/ui/scroll-area';

import type { CatalogItem } from '@/features/catalogs/domain/entities';

import type { AvailableProduct } from '../../../hooks/use-queries';

import type { ConfigurePricesMode } from './hooks/use-configure-prices';
import { useConfigurePrices } from './hooks/use-configure-prices';
import { ProductPriceCard } from './pieces/product-price-card';

interface ConfigurePricesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  catalogId: string;
  products: AvailableProduct[];
  onSuccess: () => void;
  onBack: () => void;
  mode?: ConfigurePricesMode;
  existingItems?: CatalogItem[];
}

export function ConfigurePricesDialog({
  open,
  onOpenChange,
  catalogId,
  products,
  onSuccess,
  onBack,
  mode = 'add',
  existingItems = []
}: ConfigurePricesDialogProps) {
  const {
    form,
    configuredCount,
    totalCount,
    allConfigured,
    isPending,
    handleSubmit
  } = useConfigurePrices({
    catalogId,
    products,
    open,
    onSuccess,
    mode,
    existingItems
  });

  const progressPercent =
    totalCount > 0 ? (configuredCount / totalCount) * 100 : 0;

  const isEdit = mode === 'edit';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle>
            {isEdit ? 'Editar preços' : 'Configurar produtos'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Ajuste o preço de cada produto. As alterações são salvas em lote.'
              : 'Defina o preço de cada produto. O original é opcional (só promoção).'}
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 pb-4 flex flex-col gap-1.5">
          <span className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">
              {configuredCount}
            </span>{' '}
            de {totalCount} configurados
          </span>
          <Progress value={progressPercent} className="h-1.5" />
        </div>

        <ScrollArea className="max-h-[55vh] px-6">
          <div className="flex flex-col gap-3 pb-4">
            {products.map((product, index) => (
              <ProductPriceCard
                key={product.id}
                index={index}
                product={product}
                form={form}
              />
            ))}
          </div>
        </ScrollArea>

        <DialogFooter className="px-6 py-4 border-t flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm">
            {allConfigured ? (
              <span className="text-emerald-600 flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-emerald-500 inline-block" />
                Tudo pronto
              </span>
            ) : (
              <span className="text-amber-600 flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-amber-400 inline-block" />
                {totalCount - configuredCount} sem preço
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button type="button" variant="ghost" onClick={onBack}>
              {isEdit ? 'Cancelar' : 'Voltar à seleção'}
            </Button>
            <Button
              type="button"
              disabled={!allConfigured || isPending}
              onClick={handleSubmit}
            >
              {isPending
                ? isEdit
                  ? 'Salvando…'
                  : 'Adicionando…'
                : isEdit
                  ? 'Salvar alterações'
                  : 'Adicionar ao catálogo'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
