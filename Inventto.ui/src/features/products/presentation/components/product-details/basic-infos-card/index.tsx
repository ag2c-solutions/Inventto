import { Badge } from '@/shared/components/ui/badge';

import type { IProduct } from '../../../../domain/entities';
import { ProductTableColumnStatus } from '../../product-table/columns/status';

type ProductBasicInfosCardProps = {
  name?: IProduct['name'];
  categories?: IProduct['categories'];
  sku?: IProduct['sku'];
  description?: IProduct['description'];
  isActive?: boolean;
};

export function ProductBasicInfosCard({
  name,
  categories,
  sku,
  description,
  isActive
}: ProductBasicInfosCardProps) {
  const productName = name?.trim() || 'Produto sem nome';
  const productSku = sku?.trim() || 'N/A';
  const productDescription = description?.trim();

  return (
    <div className="space-y-1.5">
      {/* Status + categories badges */}
      <div className="flex gap-2 flex-wrap items-center">
        {isActive !== undefined && (
          <ProductTableColumnStatus isActive={isActive} />
        )}

        {categories?.map((category) => (
          <Badge key={category.id} variant="secondary">
            {category.name}
          </Badge>
        ))}
      </div>

      {/* Product name */}
      <h1 className="text-3xl font-bold leading-tight">{productName}</h1>

      {/* SKU */}
      <p className="font-mono text-sm text-muted-foreground">{productSku}</p>

      {/* Description */}
      {productDescription && (
        <p className="text-sm text-muted-foreground leading-relaxed pt-1">
          {productDescription}
        </p>
      )}
    </div>
  );
}
