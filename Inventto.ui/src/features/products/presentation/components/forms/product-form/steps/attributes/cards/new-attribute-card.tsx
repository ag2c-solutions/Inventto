import { useState } from 'react';
import { Check, ChevronsUpDown, Plus, X } from 'lucide-react';
import type { UseFormReturn } from 'react-hook-form';

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/shared/components/ui/select';
import { cn } from '@/shared/utils';

import type { AttributeType } from '../../../../../../../domain/entities';
import type { ProductFormData } from '../../../schema';
import { ProductsFormFieldAttributeValues } from '../field-attribute-values';

export type SystemAttribute = {
  id: string;
  label: string;
  slug: string;
  type: AttributeType;
  values: string[];
};

type NewAttributeCardProps = {
  form: UseFormReturn<ProductFormData>;
  index: number;
  onRemove: (index: number) => void;
  systemAttributes: SystemAttribute[];
};

const fieldStateOptions = {
  shouldDirty: true,
  shouldTouch: true,
  shouldValidate: true
} as const;

export function NewAttributeCard({
  form,
  index,
  onRemove,
  systemAttributes
}: NewAttributeCardProps) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const attributeId = form.watch(`attributes.${index}.id`);
  const attributeType = form.watch(`attributes.${index}.type`);

  const isSystemAttribute = systemAttributes.some(
    (attribute) => attribute.id === attributeId
  );

  const handleSelectSystemAttribute = (attribute: SystemAttribute) => {
    form.setValue(`attributes.${index}.id`, attribute.id, fieldStateOptions);
    form.setValue(
      `attributes.${index}.name`,
      attribute.label,
      fieldStateOptions
    );
    form.setValue(
      `attributes.${index}.slug`,
      attribute.slug,
      fieldStateOptions
    );
    form.setValue(
      `attributes.${index}.type`,
      attribute.type,
      fieldStateOptions
    );
    form.setValue(
      `attributes.${index}.values`,
      attribute.values,
      fieldStateOptions
    );
    form.setValue(`attributes.${index}.isNew`, false, fieldStateOptions);

    setOpen(false);
    setInputValue('');
  };

  const handleCreateCustomAttribute = () => {
    const customAttributeName = inputValue.trim();

    if (!customAttributeName) return;

    form.setValue(`attributes.${index}.id`, undefined, fieldStateOptions);
    form.setValue(
      `attributes.${index}.name`,
      customAttributeName,
      fieldStateOptions
    );
    form.setValue(`attributes.${index}.slug`, undefined, fieldStateOptions);
    form.setValue(`attributes.${index}.isNew`, true, fieldStateOptions);

    if (isSystemAttribute) {
      form.setValue(`attributes.${index}.type`, 'text', fieldStateOptions);
      form.setValue(`attributes.${index}.values`, [], fieldStateOptions);
    }

    setOpen(false);
    setInputValue('');
  };

  return (
    <div className="rounded-xl border bg-muted/20 p-4">
      <div className="flex flex-wrap items-end gap-2.5">
        <FormField
          control={form.control}
          name={`attributes.${index}.name`}
          render={({ field }) => (
            <FormItem className="min-w-0 flex-1">
              <FormLabel>Nome do atributo</FormLabel>

              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      type="button"
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
                      value={inputValue}
                      onValueChange={setInputValue}
                    />

                    <CommandList>
                      <CommandEmpty className="p-1">
                        <div className="flex flex-col gap-1">
                          <p className="text-xs text-muted-foreground px-2 py-2 text-center">
                            Nenhum atributo encontrado.
                          </p>

                          {inputValue.trim() && (
                            <Button
                              type="button"
                              variant="ghost"
                              className="w-full justify-start h-auto py-1.5 px-2 text-sm"
                              onClick={handleCreateCustomAttribute}
                            >
                              <Plus className="mr-2 h-3 w-3" />
                              Criar "{inputValue.trim()}"
                            </Button>
                          )}
                        </div>
                      </CommandEmpty>

                      <CommandGroup heading="Sugestões do Sistema">
                        {systemAttributes.map((attribute) => (
                          <CommandItem
                            key={attribute.id}
                            value={attribute.label}
                            onSelect={() =>
                              handleSelectSystemAttribute(attribute)
                            }
                          >
                            <Check
                              className={cn(
                                'mr-2 h-4 w-4',
                                attributeId === attribute.id
                                  ? 'opacity-100'
                                  : 'opacity-0'
                              )}
                            />

                            {attribute.label}
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
            <FormItem className="w-full sm:w-[150px] sm:shrink-0">
              <FormLabel>Tipo</FormLabel>

              <FormControl>
                <Select
                  value={field.value}
                  disabled={isSystemAttribute}
                  onValueChange={(value) => {
                    form.setValue(
                      `attributes.${index}.type`,
                      value as AttributeType,
                      fieldStateOptions
                    );
                  }}
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

        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-9 shrink-0 self-end text-muted-foreground hover:text-destructive"
          onClick={() => onRemove(index)}
          aria-label="Remover atributo"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="mt-3">
        <ProductsFormFieldAttributeValues
          nameValues={`attributes.${index}.values`}
          type={attributeType ?? 'text'}
        />
      </div>
    </div>
  );
}
