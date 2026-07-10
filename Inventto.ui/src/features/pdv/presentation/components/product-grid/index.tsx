import type { PdvProduct } from '../../../domain/entities';
import { ProductCard } from '../product-card';
import { ProductCardSkeleton } from '../product-card-skeleton';

interface ProductGridProps {
  products: PdvProduct[];
  onAddProduct: (product: PdvProduct) => void;
}

export function ProductGrid({ products, onAddProduct }: ProductGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {products.map((product) => (
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
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {Array.from({ length: 10 }).map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  );
}
