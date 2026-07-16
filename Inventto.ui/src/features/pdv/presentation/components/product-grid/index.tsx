import type { PdvProduct } from '../../../domain/entities';
import { ProductCard } from '../product-card';
import { ProductCardSkeleton } from '../product-card-skeleton';

interface ProductGridProps {
  products: PdvProduct[];
  onAddProduct: (product: PdvProduct) => void;
}

export function ProductGrid({ products, onAddProduct }: ProductGridProps) {
  const sortedProducts = [...products].sort((a, b) => {
    if (a.isOut === b.isOut) return 0;
    return a.isOut ? 1 : -1;
  });

  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-3">
      {sortedProducts.map((product) => (
        <ProductCard
          key={`${product.productId}-${product.variantId ?? 'base'}`}
          product={product}
          onAdd={onAddProduct}
        />
      ))}
    </div>
  );
}

export function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-3">
      {Array.from({ length: 10 }).map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  );
}
