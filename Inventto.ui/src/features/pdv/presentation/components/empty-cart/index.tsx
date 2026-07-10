import { ShoppingCart } from 'lucide-react';

import { Button } from '@/shared/components/ui/button';

interface EmptyCartProps {
  onGoToCatalog: () => void;
}

export function EmptyCart({ onGoToCatalog }: EmptyCartProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-sidebar/70">
        <ShoppingCart className="h-6 w-6 text-muted-foreground/70" />
      </div>

      <p className="text-sm text-muted-foreground">
        Adicione produtos para iniciar a venda.
      </p>

      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={onGoToCatalog}
      >
        Ver catálogo
      </Button>
    </div>
  );
}
