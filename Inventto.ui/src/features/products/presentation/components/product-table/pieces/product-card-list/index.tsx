import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { Download, PlusCircle, Search } from 'lucide-react';

import { Input } from '@/shared/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/shared/components/ui/select';

import { ActionButton } from '@/features/permissions';

import type { IProduct } from '../../../../../domain/entities';
import { STATUS_FILTER_OPTIONS } from '../../../../constants/status-filter-options';
import { deriveProductStatus } from '../../../../utils/derive-product-status';

import { ProductCard } from './pieces/product-card';

type CategoryOption = { value: string; label: string };

type ProductCardListProps = {
  products: IProduct[];
  categoryOptions: CategoryOption[];
};

export function ProductCardList({
  products,
  categoryOptions
}: ProductCardListProps) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [status, setStatus] = useState('all');

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        !term ||
        product.name.toLowerCase().includes(term) ||
        product.sku.toLowerCase().includes(term);

      const matchesCategory =
        category === 'all' || product.categories.some((c) => c.id === category);

      const matchesStatus =
        status === 'all' || deriveProductStatus(product) === status;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [products, search, category, status]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Produtos</h1>

        <div className="flex items-center gap-2">
          <ActionButton
            action="product:create"
            size="icon"
            variant="outline"
            aria-label="Importar produtos"
            asChild
          >
            <Link to="/products/import">
              <Download className="h-4 w-4" />
            </Link>
          </ActionButton>

          <ActionButton
            action="product:create"
            size="icon"
            className="bg-green-950"
            aria-label="Cadastrar produto"
            asChild
          >
            <Link to="/products/create">
              <PlusCircle className="h-4 w-4" />
            </Link>
          </ActionButton>
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou SKU"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="pl-9"
          />
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Todas as categorias" />
            </SelectTrigger>
            <SelectContent>
              {categoryOptions.map(({ value, label }) => (
                <SelectItem key={`category-${value}`} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Todos os status" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_FILTER_OPTIONS.map(({ value, label }) => (
                <SelectItem key={`status-${value}`} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          {search.trim()
            ? `Nada encontrado para '${search.trim()}'.`
            : 'Nada encontrado. Tente ajustar os filtros de categoria e status.'}
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
