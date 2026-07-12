import type { FeaturedProduct } from '../../../domain/entities';
import { useToggleFeatureMutation } from '../../hooks/use-mutations';
import { useFeaturableProductsQuery } from '../../hooks/use-queries';
import { FeaturedRow } from '../featured-row';

interface FeaturedListProps {
  storefrontId?: string;
  catalogId?: string;
}

export function FeaturedList({ storefrontId, catalogId }: FeaturedListProps) {
  const { data: products, isLoading } = useFeaturableProductsQuery(
    storefrontId,
    catalogId
  );
  const { mutate: toggleFeature, isPending } = useToggleFeatureMutation();

  function handleToggle(product: FeaturedProduct) {
    if (!storefrontId) return;

    toggleFeature({
      storefrontId,
      productId: product.productId,
      variantId: product.variantId,
      on: !product.isFeatured,
      catalogProductIds: (products ?? []).map((item) => item.productId)
    });
  }

  if (!storefrontId) {
    return (
      <p className="text-sm text-muted-foreground">
        Salve a vitrine para poder destacar produtos.
      </p>
    );
  }

  if (!catalogId) {
    return (
      <p className="text-sm text-muted-foreground">
        Vincule um catálogo na aba Geral para destacar produtos.
      </p>
    );
  }

  if (isLoading) {
    return (
      <p className="text-sm text-muted-foreground">Carregando produtos…</p>
    );
  }

  if (!products || products.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        O catálogo vinculado ainda não tem produtos.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {products.map((product) => (
        <FeaturedRow
          key={product.productId}
          product={product}
          onToggle={handleToggle}
          disabled={isPending}
        />
      ))}
    </div>
  );
}
