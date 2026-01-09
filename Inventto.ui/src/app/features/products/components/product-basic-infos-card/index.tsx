import { Badge } from '@/app/components/ui/badge';
import type { IProduct } from '../../types/models';
import { Separator } from '@/app/components/ui/separator';

type TProductBasicInfosCard = {
  name?: IProduct['name'];
  category?: never;
  categories?: IProduct['categories'];
  sku?: IProduct['sku'];
  description: IProduct['description'];
};
export function ProductBasicInfosCard({
  name,
  categories,
  sku,
  description
}: TProductBasicInfosCard) {
  return (
    <div>
      <div>
        <h2 className="text-2xl font-bold">{name || ' '}</h2>
        <div className="flex gap-2 mb-2 flex-wrap">
          <Badge variant="outline">SKU: {sku || 'N/A'}</Badge>
          {categories?.map((cat) => (
            <Badge key={cat.id} variant="secondary">
              {cat.name}
            </Badge>
          ))}
        </div>
        <Separator />
      </div>
      <p className="text-sm text-muted-foreground mb-2">{description || ''}</p>
    </div>
  );
}
