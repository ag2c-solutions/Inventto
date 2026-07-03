'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';

import { Button } from '@/shared/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/shared/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/shared/components/ui/popover';

import { useMovementForm } from '../../hooks';

export function ProductSearch() {
  const { products, actions, isLoadingProducts } = useMovementForm();
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          role="combobox"
          aria-expanded={open}
          disabled={isLoadingProducts}
          className="gap-1.5"
        >
          <Plus className="h-3.5 w-3.5" />
          {isLoadingProducts ? 'Carregando…' : 'Adicionar produto'}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-80 p-0"
        align="end"
        side="bottom"
        avoidCollisions={false}
      >
        <Command>
          <CommandInput placeholder="Buscar por nome ou SKU..." />
          <CommandList>
            <CommandEmpty>Nenhum produto encontrado.</CommandEmpty>
            <CommandGroup>
              {products.map((product) => (
                <CommandItem
                  key={product.id}
                  value={`${product.name} ${product.sku || ''}`}
                  onSelect={() => {
                    actions.selectProduct(product);
                    setOpen(false);
                  }}
                  className="cursor-pointer"
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className="h-8 w-8 rounded overflow-hidden bg-muted border shrink-0">
                      <img
                        src={product.allImages?.[0]?.url || '/placeholder.svg'}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex flex-col overflow-hidden">
                      <span className="font-medium truncate">
                        {product.name}
                      </span>
                      {product.sku && (
                        <span className="text-xs text-muted-foreground">
                          SKU: {product.sku}
                        </span>
                      )}
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
