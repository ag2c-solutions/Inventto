import { Badge } from '@/shared/components/ui/badge';
import { Separator } from '@/shared/components/ui/separator';

import type { IProduct } from '../../../domain/entities';

type ProductBasicInfosCardProps = {
  name?: IProduct['name'];
  categories?: IProduct['categories'];
  sku?: IProduct['sku'];
  description?: IProduct['description'];
};

export function ProductBasicInfosCard({
  name,
  categories,
  sku,
  description
}: ProductBasicInfosCardProps) {
  const productName = name?.trim() || 'Produto sem nome';
  const productSku = sku?.trim() || 'N/A';
  const productDescription = description?.trim();

  return (
    <div>
      <div>
        <h2 className="text-2xl font-bold">{productName}</h2>

        <div className="flex gap-2 mb-2 flex-wrap">
          <Badge variant="outline">SKU: {productSku}</Badge>

          {categories?.map((category) => (
            <Badge key={category.id} variant="secondary">
              {category.name}
            </Badge>
          ))}
        </div>

        <Separator />
      </div>

      {productDescription && (
        <p className="text-sm text-muted-foreground mb-2">
          {productDescription}
        </p>
      )}
    </div>
  );
}
