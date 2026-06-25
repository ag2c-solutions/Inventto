import {
  Avatar,
  AvatarFallback,
  AvatarImage
} from '@/shared/components/ui/avatar';

import type { IProduct } from '../../../../domain/entities';
import { getImageSrc } from '../../../utils/get-img-src';

type ProductTableColumnProductProps = {
  product: IProduct;
};

export function ProductTableColumnProduct({
  product
}: ProductTableColumnProductProps) {
  const primaryImage =
    product.allImages.find((image) => image.isPrimary) ?? product.allImages[0];

  const variantsCount = product.hasVariants ? product.variants.length : 0;

  return (
    <div className="flex items-center gap-3">
      <Avatar className="h-11 w-11 rounded-md">
        {primaryImage && (
          <AvatarImage
            src={getImageSrc(primaryImage, 150)}
            alt={product.name}
            className="object-cover"
          />
        )}
        <AvatarFallback className="rounded-md text-[10px]">IMG</AvatarFallback>
      </Avatar>

      <div className="flex flex-col">
        <span className="font-medium text-foreground">{product.name}</span>
        <span className="text-xs text-green-700">{product.sku}</span>
        {variantsCount > 0 && (
          <span className="text-xs text-muted-foreground">
            {variantsCount} {variantsCount === 1 ? 'variação' : 'variações'}
          </span>
        )}
      </div>
    </div>
  );
}
