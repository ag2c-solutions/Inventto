import { NavLink } from 'react-router';
import { ChevronLeft } from 'lucide-react';

export function BackToProductsLink() {
  return (
    <NavLink
      to="/products"
      className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
    >
      <ChevronLeft className="size-4" />
      <span>Produtos</span>
    </NavLink>
  );
}
