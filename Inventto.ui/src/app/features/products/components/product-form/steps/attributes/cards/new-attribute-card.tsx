import { useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { X, Check, ChevronsUpDown, Plus } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent } from '@/app/components/ui/card';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/app/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/app/components/ui/select';
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

import type { ProductFormData } from '../../../schema';
import { ProductsFormFieldAttributeValues } from '../field-attribute-values';
import type { AttributeType } from '@/app/features/products/types/models';
import { cn } from '@/lib/utils';

export type SystemAttribute = {
  id: string;
  label: string;
  slug: string;
  type: string;
  values: string[];
};

type NewAttributeCardProps = {
  form: UseFormReturn<ProductFormData>;
  index: number;
  onRemove: (index: number) => void;
  systemAttributes: SystemAttribute[];
};

export function NewAttributeCard({
  form,
  index,
  onRemove,
  systemAttributes
}: NewAttributeCardProps) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const attributeType = form.watch(`attributes.${index}.type`);
  const attributeName = form.watch(`attributes.${index}.name`);

  const isSystemAttribute = systemAttributes.some(
    (attr) => attr.label.toLowerCase() === attributeName?.toLowerCase()
  );

  const handleSelectSystemAttribute = (attr: SystemAttribute) => {
    form.setValue(`attributes.${index}.name`, attr.label, {
      shouldValidate: true
    });
    form.setValue(`attributes.${index}.type`, attr.type as AttributeType, {
      shouldValidate: true
    });
    form.setValue(`attributes.${index}.values`, attr.values || [], {
      shouldValidate: true
    });
    setOpen(false);
  };

  const handleCreateCustomAttribute = () => {
    if (!inputValue) return;

    form.setValue(`attributes.${index}.name`, inputValue, {
      shouldValidate: true
    });

    if (isSystemAttribute) {
      form.setValue(`attributes.${index}.type`, 'text');
      form.setValue(`attributes.${index}.values`, []);
    }

    setOpen(false);
  };

  return (
    <Card className="relative overflow-hidden aspect-square w-full flex flex-col bg-muted/20">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="absolute right-2 top-2 h-6 w-6 text-muted-foreground hover:text-destructive z-10"
        onClick={() => onRemove(index)}
        aria-label="Remover atributo"
      >
        <X className="h-4 w-4" />
      </Button>

      <CardContent className="h-full flex flex-col gap-4 p-6">
        <FormField
          control={form.control}
          name={`attributes.${index}.name`}
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>Nome</FormLabel>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={open}
                      className={cn(
                        'w-full justify-between font-normal',
                        !field.value && 'text-muted-foreground'
                      )}
                    >
                      {field.value || 'Selecionar ou criar...'}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-[250px] p-0" align="start">
                  <Command>
                    <CommandInput
                      placeholder="Buscar atributo..."
                      onValueChange={setInputValue}
                    />
                    <CommandList>
                      <CommandEmpty className="p-1">
                        <div className="flex flex-col gap-1">
                          <p className="text-xs text-muted-foreground px-2 py-2 text-center">
                            Nenhum atributo encontrado.
                          </p>
                          {inputValue && (
                            <Button
                              variant="ghost"
                              className="w-full justify-start h-auto py-1.5 px-2 text-sm"
                              onClick={handleCreateCustomAttribute}
                            >
                              <Plus className="mr-2 h-3 w-3" />
                              Criar "{inputValue}"
                            </Button>
                          )}
                        </div>
                      </CommandEmpty>

                      <CommandGroup heading="Sugestões do Sistema">
                        {systemAttributes.map((attr) => (
                          <CommandItem
                            key={attr.id}
                            value={attr.label}
                            onSelect={() => handleSelectSystemAttribute(attr)}
                          >
                            <Check
                              className={cn(
                                'mr-2 h-4 w-4',
                                attributeName === attr.label
                                  ? 'opacity-100'
                                  : 'opacity-0'
                              )}
                            />
                            {attr.label}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`attributes.${index}.type`}
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>Tipo</FormLabel>
              <FormControl>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  value={field.value}
                  disabled={isSystemAttribute}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Texto</SelectItem>
                    <SelectItem value="number">Número</SelectItem>
                    <SelectItem value="color">Cor</SelectItem>
                    <SelectItem value="select">Seleção</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex-1 overflow-y-auto">
          <ProductsFormFieldAttributeValues
            nameValues={`attributes.${index}.values`}
            type={attributeType as AttributeType}
          />
        </div>
      </CardContent>
    </Card>
  );
}
