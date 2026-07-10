import { ShoppingCart } from 'lucide-react';

export function EmptyCart() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/30 bg-muted/30">
        <ShoppingCart className="h-7 w-7 text-muted-foreground/60" />
      </div>

      <p className="text-sm text-muted-foreground">
        Adicione produtos para iniciar a venda.
      </p>
    </div>
  );
}
