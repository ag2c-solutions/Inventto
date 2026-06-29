import type { UseFormReturn } from 'react-hook-form';

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/shared/components/ui/form';
import { Input } from '@/shared/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/shared/components/ui/select';

import type { ProductFormData } from '../../../schema';
import { ProductsFormFieldAttributeValues } from '../field-attribute-values';

type ExistingAttributeCardProps = {
  form: UseFormReturn<ProductFormData>;
  index: number;
};

export function ExistingAttributeCard({
  form,
  index
}: ExistingAttributeCardProps) {
  const attributeType = form.watch(`attributes.${index}.type`);

  return (
    <div className="rounded-xl border bg-muted/20 p-4">
      <div className="flex flex-wrap items-end gap-2.5">
        <FormField
          control={form.control}
          name={`attributes.${index}.name`}
          render={({ field }) => (
            <FormItem className="min-w-0 flex-1">
              <FormLabel>Nome do atributo</FormLabel>
              <FormControl>
                <Input disabled placeholder="ex: Tamanho" {...field} />
              </FormControl>
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
                  disabled
                  onValueChange={field.onChange}
                  value={field.value}
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
