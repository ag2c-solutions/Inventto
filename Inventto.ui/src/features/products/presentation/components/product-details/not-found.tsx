import { Link } from 'react-router';
import { ChevronLeft, Package } from 'lucide-react';

import { Button } from '@/shared/components/ui/button';

import { BackToProductsLink } from '../actions/back-to-products';

export function ProductNotFound() {
  return (
    <div className="px-4 md:px-6 pt-4 space-y-6">
      <BackToProductsLink />

      <div className="rounded-xl border bg-card p-10 flex flex-col items-center justify-center gap-4 text-center">
        <div className="flex size-16 items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/30 bg-muted/30 text-muted-foreground">
          <Package className="size-7" />
        </div>

        <div className="space-y-1.5">
          <p className="text-lg font-bold">Produto não encontrado</p>
          <p className="text-sm text-muted-foreground max-w-sm">
            Este produto pode ter sido removido ou o endereço está incorreto.
            Volte para a lista e tente novamente.
          </p>
        </div>

        <Button variant="outline" asChild className="gap-2">
          <Link to="/products">
            <ChevronLeft className="size-4" />
            Voltar para Produtos
          </Link>
        </Button>
      </div>
    </div>
  );
}
