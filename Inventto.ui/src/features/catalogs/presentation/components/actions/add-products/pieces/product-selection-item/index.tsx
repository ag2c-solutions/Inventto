import {
  Avatar,
  AvatarFallback,
  AvatarImage
} from '@/shared/components/ui/avatar';
import { Badge } from '@/shared/components/ui/badge';
import { Checkbox } from '@/shared/components/ui/checkbox';

import type { AvailableProduct } from '../../../../../hooks/use-queries';

interface ProductSelectionItemProps {
  product: AvailableProduct;
  isSelected: boolean;
  onToggle: (id: string) => void;
}

export function ProductSelectionItem({
  product,
  isSelected,
  onToggle
}: ProductSelectionItemProps) {
  return (
    <label className="flex items-center gap-3 rounded-md border p-2 cursor-pointer has-disabled:cursor-not-allowed has-disabled:opacity-60">
      <Checkbox
        checked={product.alreadyAdded || isSelected}
        disabled={product.alreadyAdded}
        onCheckedChange={() => onToggle(product.id)}
      />

      <Avatar className="h-9 w-9 rounded-md">
        {product.imageUrl && (
          <AvatarImage
            src={product.imageUrl}
            alt={product.name}
            className="object-cover"
          />
        )}
        <AvatarFallback className="rounded-md text-[10px]">IMG</AvatarFallback>
      </Avatar>

      <div className="flex flex-col flex-1 min-w-0">
        <span className="text-sm font-medium truncate">{product.name}</span>
        <span className="text-xs text-muted-foreground">{product.sku}</span>
      </div>

      {product.alreadyAdded ? (
        <Badge variant="secondary">Já adicionado</Badge>
      ) : product.hasVariants ? (
        <span className="text-xs text-muted-foreground shrink-0">
          {product.variants.length} variantes
        </span>
      ) : null}
    </label>
  );
}
