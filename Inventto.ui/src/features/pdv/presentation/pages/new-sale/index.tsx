import { useMemo, useState } from 'react';
import { ShoppingCart } from 'lucide-react';

import { Badge } from '@/shared/components/ui/badge';

import { useCategoriesQuery } from '@/features/categories';

import type { PdvProduct } from '../../../domain/entities';
import { AddProductDialog } from '../../components/add-product-dialog';
import { CartFab } from '../../components/cart-fab';
import { CartSheet } from '../../components/cart-sheet';
import { CatalogSearchBar } from '../../components/catalog-search-bar';
import { NoCatalogBlock } from '../../components/no-catalog-block';
import {
  ProductGrid,
  ProductGridSkeleton
} from '../../components/product-grid';
import {
  usePdvCatalogQuery,
  usePdvProductsQuery
} from '../../hooks/use-queries';
import { selectCartCount, useCartStore } from '../../stores/cart-store';

export function NewSalePage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState<PdvProduct | null>(
    null
  );
  const [isCartOpen, setIsCartOpen] = useState(false);

  const { data: catalog, isLoading: isCatalogLoading } = usePdvCatalogQuery();
  const { data: products, isLoading: isProductsLoading } = usePdvProductsQuery(
    catalog?.id
  );
  const { data: categories = [] } = useCategoriesQuery();

  const cartCount = useCartStore(selectCartCount);

  const filteredProducts = useMemo(() => {
    if (!products) return [];

    const term = search.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        !term ||
        product.name.toLowerCase().includes(term) ||
        (product.sku ?? '').toLowerCase().includes(term);

      const matchesCategory =
        category === 'all' || product.categoryId === category;

      return matchesSearch && matchesCategory;
    });
  }, [products, search, category]);

  function handleAddProduct(product: PdvProduct) {
    setSelectedProduct(product);
  }

  function renderBody() {
    if (isCatalogLoading) return <ProductGridSkeleton />;
    if (!catalog) return <NoCatalogBlock />;
    if (isProductsLoading) return <ProductGridSkeleton />;
    // RN065: catálogo vinculado mas sem itens cai no mesmo bloqueio.
    if (!products || products.length === 0) return <NoCatalogBlock />;

    return (
      <>
        <CatalogSearchBar
          search={search}
          onSearchChange={setSearch}
          category={category}
          onCategoryChange={setCategory}
          categories={categories}
        />

        {filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center gap-1 py-16 text-center">
            <h3 className="text-sm font-medium">
              {search.trim()
                ? `Nenhum produto encontrado para "${search.trim()}".`
                : 'Nenhum produto encontrado.'}
            </h3>
            <p className="text-sm text-muted-foreground">
              Verifique o termo buscado ou limpe o filtro de categoria.
            </p>
          </div>
        ) : (
          <ProductGrid
            products={filteredProducts}
            onAddProduct={handleAddProduct}
          />
        )}
      </>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-col gap-1.5 px-1 py-6 md:px-6">
        <div className="flex w-full justify-between flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">
            Venda no balcão
          </h1>
          {catalog && (
            <Badge
              variant="secondary"
              className="gap-1.5 py-2 border border-border"
            >
              <ShoppingCart className="h-5 w-3.5" />
              Catálogo: {catalog.name}
            </Badge>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 px-1 pb-24 md:px-6">
        {renderBody()}
      </div>

      <CartFab count={cartCount} onClick={() => setIsCartOpen(true)} />

      <AddProductDialog
        product={selectedProduct}
        onOpenChange={(open) => !open && setSelectedProduct(null)}
      />

      <CartSheet
        open={isCartOpen}
        onOpenChange={(open) => {
          setIsCartOpen(open);
          // Sucesso ou "Ver catálogo": foco volta à busca (wireframe §03).
          if (!open) {
            document.getElementById('pdv-search-input')?.focus();
          }
        }}
      />
    </div>
  );
}
