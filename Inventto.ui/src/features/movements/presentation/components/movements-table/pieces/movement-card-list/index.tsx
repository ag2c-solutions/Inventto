import { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown, Search } from 'lucide-react';

import { Input } from '@/shared/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';

import type { Movement, MovementType } from '../../../../../domain/entities';
import { ProductFilterChip } from '../../../filter-chip';
import { matchesProductSearch } from '../../utils/matches-product-search';

import { MovementCard } from './pieces/movement-card';

type TypeFilter = MovementType | 'all';

interface MovementCardListProps {
  movements: Movement[];
  productId?: string;
  productName?: string;
}

export function MovementCardList({
  movements,
  productId,
  productName
}: MovementCardListProps) {
  const [search, setSearch] = useState('');
  const [type, setType] = useState<TypeFilter>('all');

  const filteredMovements = useMemo(() => {
    return movements.filter((movement) => {
      const matchesType = type === 'all' || movement.type === type;
      return matchesType && matchesProductSearch(movement, search);
    });
  }, [movements, search, type]);

  const searchTerm = search.trim();

  return (
    <div className="flex flex-col gap-4">
      {productId && <ProductFilterChip productName={productName} />}

      <div className="flex flex-col gap-2.5">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por produto ou SKU"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="pl-9"
          />
        </div>

        <Tabs
          value={type}
          onValueChange={(value) => setType(value as TypeFilter)}
        >
          <TabsList className="w-full grid grid-cols-3 h-9 bg-sidebar">
            <TabsTrigger value="all">
              <ArrowUpDown className="h-3.5 w-3.5" />
              Todos
            </TabsTrigger>
            <TabsTrigger value="entry" className="gap-1.5">
              <ArrowUp className="h-3.5 w-3.5" />
              Entradas
            </TabsTrigger>
            <TabsTrigger value="withdrawal" className="gap-1.5">
              <ArrowDown className="h-3.5 w-3.5" />
              Saídas
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {filteredMovements.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          {searchTerm
            ? `Nada encontrado para '${searchTerm}'.`
            : 'Nada encontrado. Tente ajustar os filtros de tipo e período.'}
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredMovements.map((movement) => (
            <MovementCard key={movement.id} movement={movement} />
          ))}
        </div>
      )}
    </div>
  );
}
