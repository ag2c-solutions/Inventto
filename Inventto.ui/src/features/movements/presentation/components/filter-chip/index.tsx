import { Link } from 'react-router';
import { X } from 'lucide-react';

import { Badge } from '@/shared/components/ui/badge';

interface ProductFilterChipProps {
  productName?: string;
}
export function ProductFilterChip({ productName }: ProductFilterChipProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">
        Filtrando por produto:
      </span>
      <Badge variant="secondary" className="py-1 text-primary pl-2.5 pr-1.5">
        <span className="font-medium">Produto:</span>
        {productName || 'Produto selecionado'}
        <Link
          to="/movements"
          className="ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20"
          aria-label="Limpar filtro de produto"
        >
          <X className="h-3 w-3 text-red-800" />
        </Link>
      </Badge>
    </div>
  );
}
