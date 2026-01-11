'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/app/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/app/components/ui/popover';
import { Button } from '@/app/components/ui/button';
import { cn } from '@/lib/utils';
import { useMovementForm } from '../../hooks';

export function ProductSearch() {
  const { products, actions, isLoadingProducts } = useMovementForm();
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={isLoadingProducts}
          className={cn(
            'w-full justify-between border-0 py-6 bg-muted px-4 font-normal text-muted-foreground hover:bg-muted',
            'text-left'
          )}
        >
          <span className="text-lg">
            {isLoadingProducts
              ? 'Carregando catálogo...'
              : 'Buscar produto para adicionar...'}
          </span>
          <Search className="ml-2 h-4 w-4 opacity-50 shrink-0" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-[--radix-popover-trigger-width] p-0"
        align="start"
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
