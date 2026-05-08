import type { UseFormReturn } from 'react-hook-form';

import { Card, CardContent } from '@/shared/components/ui/card';
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
    <Card className="relative overflow-hidden aspect-square w-full flex flex-col bg-muted/20">
      <CardContent className="h-full flex flex-col gap-4 p-6">
        <FormField
          control={form.control}
          name={`attributes.${index}.name`}
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>Nome</FormLabel>
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
            <FormItem className="w-full">
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

        <div className="flex-1 overflow-y-auto">
          <ProductsFormFieldAttributeValues
            nameValues={`attributes.${index}.values`}
            type={attributeType ?? 'text'}
          />
        </div>
      </CardContent>
    </Card>
  );
}
