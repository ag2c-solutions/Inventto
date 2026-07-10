import { ShoppingCart } from 'lucide-react';

import { Button } from '@/shared/components/ui/button';

interface CartFabProps {
  count: number;
  onClick: () => void;
}

export function CartFab({ count, onClick }: CartFabProps) {
  if (count === 0) return null;

  return (
    <Button
      type="button"
      onClick={onClick}
      aria-label="Ver venda atual"
      className="fixed bottom-6 right-6 z-40 flex h-14 items-center gap-2 rounded-full px-5 shadow-lg"
    >
      <ShoppingCart className="h-5 w-5" />
      <span className="text-sm font-semibold">{count}</span>
    </Button>
  );
}
