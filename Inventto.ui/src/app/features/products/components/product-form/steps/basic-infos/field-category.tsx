import { Check, ChevronsUpDown, PlusCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/app/components/ui/button';

import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/app/components/ui/popover';

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/app/components/ui/command';

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/app/components/ui/form';

import { useProductForm } from '../../hook';
import { useCategoryField } from './use-category-field';
import { usePermission } from '@/app/features/permissions/hooks/use-permissions';

export function ProductFormFieldCategory() {
  const { can } = usePermission();
  const { form } = useProductForm();
  const {
    open,
    setOpen,
    searchQuery,
    setSearchQuery,
    filteredCategories,
    showCreateOption,
    isCreating,
    handleCreateCategory
  } = useCategoryField({
    onSelect: () => { } 
  });

  return (
    <FormField
      control={form.control}
      name={'categories'}
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel>Categorias</FormLabel>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className={cn(
                    'w-full justify-between border-input text-sm font-normal bg-transparent selection:bg-primary selection:text-primary-foreground h-auto min-h-10 py-2',
                    (!field.value || field.value.length === 0) &&
                    'text-muted-foreground'
                  )}
                >
                  {field.value && field.value.length > 0 ? (
                    <div className="flex gap-1 flex-wrap">
                      {field.value.map((cat: { id: string; name: string }) => (
                        <div
                          key={cat.id}
                          className="bg-secondary text-secondary-foreground px-2 py-0.5 rounded text-xs flex items-center gap-1"
                        >
                          {cat.name}
                        </div>
                      ))}
                    </div>
                  ) : (
                    'Selecione categorias'
                  )}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-[var(--radix-popper-anchor-width)] p-0">
              <Command className="w-full">
                <CommandInput
                  placeholder="Pesquisar categoria..."
                  value={searchQuery}
                  onValueChange={setSearchQuery}
                />
                <CommandList>
                  <CommandEmpty>
                    {isCreating ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" /> Criando...
                      </span>
                    ) : (
                      'Nenhuma categoria encontrada.'
                    )}
                  </CommandEmpty>

                  <CommandGroup>
                    {filteredCategories.map((cat) => {
                      const isSelected = field.value?.some(
                        (selected: { id: string }) => selected.id === cat.id
                      );

                      return (
                        <CommandItem
                          key={cat.id}
                          value={cat.name}
                          onSelect={() => {
                            const current = field.value || [];
                            const next = isSelected
                              ? current.filter(
                                (c: { id: string }) => c.id !== cat.id
                              )
                              : [...current, cat];

                            form.setValue('categories', next);
                            setSearchQuery('');
                          }}
                        >
                          <Check
                            className={cn(
                              'mr-2 h-4 w-4',
                              isSelected ? 'opacity-100' : 'opacity-0'
                            )}
                          />
                          {cat.name}
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>

                  {showCreateOption && !isCreating && can('category:create') && (
                    <CommandGroup>
                      <CommandItem
                        value={searchQuery}
                        onSelect={async () => {
                          const newCat = await handleCreateCategory();
                          if (newCat) {
                            const current = field.value || [];
                            form.setValue('categories', [
                              ...current,
                              { id: newCat.id, name: newCat.name }
                            ]);
                          }
                        }}
                        className="text-green-700 cursor-pointer font-medium"
                      >
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Criar nova: "{searchQuery}"
                      </CommandItem>
                    </CommandGroup>
                  )}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
