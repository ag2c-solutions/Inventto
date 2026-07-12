import { NavLink } from 'react-router';
import { ChevronLeft } from 'lucide-react';

export function BackToStorefrontsLink() {
  return (
    <NavLink
      to="/storefronts"
      className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
    >
      <ChevronLeft className="size-4" />
      <span>Vitrines</span>
    </NavLink>
  );
}
