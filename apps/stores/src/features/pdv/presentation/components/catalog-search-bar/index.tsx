import { Search } from 'lucide-react';

import { Input } from '@/shared/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/shared/components/ui/select';

interface CatalogSearchBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  category: string;
  onCategoryChange: (value: string) => void;
  categories: Array<{ id: string; name: string }>;
}

export function CatalogSearchBar({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  categories
}: CatalogSearchBarProps) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          id="pdv-search-input"
          placeholder="Buscar produto ou SKU no catálogo…"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          className="pl-9"
        />
      </div>

      <Select value={category} onValueChange={onCategoryChange}>
        <SelectTrigger className="w-full sm:w-[220px]">
          <SelectValue placeholder="Todas as categorias" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas as categorias</SelectItem>
          {categories.map((c) => (
            <SelectItem key={c.id} value={c.id}>
              {c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
