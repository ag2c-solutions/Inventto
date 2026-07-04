import { Check, ChevronsUpDown, Loader2, PlusCircle } from 'lucide-react';

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
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/shared/components/ui/form';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/shared/components/ui/popover';
import { cn } from '@/shared/utils';

import { usePermission } from '@/features/permissions';

import { useProductForm } from '../../hook';

import { useCategoryField } from './use-category-field';

type ProductFormCategory = {
  id: string;
  name: string;
};

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
  } = useCategoryField();

  const setCategories = (categories: ProductFormCategory[]) => {
    form.setValue('categories', categories, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true
    });
  };

  return (
    <FormField
      control={form.control}
      name="categories"
      render={({ field }) => {
        const selectedCategories = field.value ?? [];

        return (
          <FormItem className="flex flex-col">
            <FormLabel>Categorias</FormLabel>

            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    type="button"
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn(
                      'w-full justify-between border-input text-sm font-normal bg-transparent selection:bg-primary selection:text-primary-foreground h-auto min-h-10 py-2',
                      selectedCategories.length === 0 && 'text-muted-foreground'
                    )}
                  >
                    {selectedCategories.length > 0 ? (
                      <div className="flex gap-1 flex-wrap">
                        {selectedCategories.map((category) => (
                          <div
                            key={category.id}
                            className="bg-secondary text-secondary-foreground px-2 py-0.5 rounded text-xs flex items-center gap-1"
                          >
                            {category.name}
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
                <Command className="w-full" shouldFilter={false}>
                  <CommandInput
                    placeholder="Pesquisar categoria..."
                    value={searchQuery}
                    onValueChange={setSearchQuery}
                  />

                  <CommandList>
                    <CommandEmpty>
                      {isCreating ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Criando...
                        </span>
                      ) : (
                        'Nenhuma categoria encontrada.'
                      )}
                    </CommandEmpty>

                    <CommandGroup>
                      {filteredCategories.map((category) => {
                        const isSelected = selectedCategories.some(
                          (selectedCategory) =>
                            selectedCategory.id === category.id
                        );

                        return (
                          <CommandItem
                            key={category.id}
                            value={category.name}
                            onSelect={() => {
                              const nextCategories = isSelected
                                ? selectedCategories.filter(
                                    (selectedCategory) =>
                                      selectedCategory.id !== category.id
                                  )
                                : [
                                    ...selectedCategories,
                                    {
                                      id: category.id,
                                      name: category.name
                                    }
                                  ];

                              setCategories(nextCategories);
                              setSearchQuery('');
                            }}
                          >
                            <Check
                              className={cn(
                                'mr-2 h-4 w-4',
                                isSelected ? 'opacity-100' : 'opacity-0'
                              )}
                            />

                            {category.name}
                          </CommandItem>
                        );
                      })}
                    </CommandGroup>

                    {showCreateOption &&
                      !isCreating &&
                      can('category:create') && (
                        <CommandGroup>
                          <CommandItem
                            value={searchQuery}
                            className="text-green-700 cursor-pointer font-medium"
                            onSelect={async () => {
                              const newCategory = await handleCreateCategory();

                              if (!newCategory) return;

                              const currentCategories =
                                form.getValues('categories') ?? [];

                              const alreadySelected = currentCategories.some(
                                (category) => category.id === newCategory.id
                              );

                              if (alreadySelected) return;

                              setCategories([
                                ...currentCategories,
                                {
                                  id: newCategory.id,
                                  name: newCategory.name
                                }
                              ]);
                            }}
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
        );
      }}
    />
  );
}
