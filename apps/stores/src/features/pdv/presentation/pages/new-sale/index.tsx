import { useMemo, useState } from 'react';

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
      <div className="flex flex-col gap-1.5 px-1 py-2 md:px-6">
        <div className="flex flex-col w-full flex-wrap  gap-3">
          <span className="flex  gap-1.5">
            <h1 className="text-2xl font-semibold tracking-tight">
              Venda no balcão
            </h1>
            {catalog && (
              <span className="inline-flex items-center gap-1.5 rounded-full border bg-sidebar px-2.5 py-1 text-xs font-semibold text-sidebar-foreground">
                <span className="size-[7px] rounded-full bg-amber-500" />
                Catálogo: {catalog.name}
              </span>
            )}
          </span>
          <p className="text-sm text-muted-foreground max-w-[600px]">
            Registre vendas presenciais de forma rápida e prática. Adicione os
            produtos ao carrinho, identifique o cliente se necessário e conclua
            o pagamento no caixa.
          </p>
        </div>
      </div>

      <div className="flex flex-1 flex-col pt-4 gap-4 px-1 pb-24 md:px-6">
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
        }}
      />
    </div>
  );
}
