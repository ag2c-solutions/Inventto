import { useFieldArray } from 'react-hook-form';

import { VariantOptionBadge } from '@/shared/components/common/variants-options-badge';
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage
} from '@/shared/components/ui/form';
import { Input } from '@/shared/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/shared/components/ui/table';

import { useProductForm } from '../../hook';

import { ProductFormFieldVariantImages } from './field-variant-images';

export function ProductVariants() {
  const { form, mode } = useProductForm();

  const { fields } = useFieldArray({
    control: form.control,
    name: 'variants'
  });

  if (fields.length === 0) {
    return (
      <div className="text-center text-muted-foreground">
        <p>Nenhuma variante gerada.</p>
        <p>Volte ao Passo 2 para adicionar atributos.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium">Detalhes das Variantes</h3>
        <p className="text-sm text-muted-foreground">
          Preencha as informações para cada variação gerada.
        </p>
      </div>
      <div className="rounded-md border">
        <Table key={`product-variants-${form.getValues('name')}`}>
          <TableHeader>
            <TableRow>
              <TableHead>Imagens</TableHead>
              <TableHead>Atributos</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Preço de Custo</TableHead>
              <TableHead>Estoque Mínimo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fields.map((field, index) => (
              <TableRow key={field.id}>
                <TableCell className="flex gap-1">
                  <ProductFormFieldVariantImages
                    key={`variants.${index}.name`}
                    variantIndex={index}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {field.options?.map((opt, index) => (
                      <VariantOptionBadge
                        key={`variants.${index}.options.${index}`}
                        option={opt}
                      />
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <FormField
                    control={form.control}
                    name={`variants.${index}.sku`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            placeholder="SKU da Variação"
                            disabled={mode === 'Create' ? false : true}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TableCell>
                <TableCell>
                  <FormField
                    control={form.control}
                    name={`variants.${index}.costPrice`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            {...field}
                            disabled={true}
                            onChange={(event) => {
                              const value = event.target.value;
                              field.onChange(value === '' ? null : +value);
                            }}
                            value={field.value ?? ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TableCell>
                <TableCell>
                  <FormField
                    control={form.control}
                    name={`variants.${index}.minimumStock`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            type="number"
                            step="1"
                            placeholder="0"
                            {...field}
                            onChange={(event) => {
                              const value = event.target.value;
                              field.onChange(value === '' ? null : +value);
                            }}
                            value={field.value ?? ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
