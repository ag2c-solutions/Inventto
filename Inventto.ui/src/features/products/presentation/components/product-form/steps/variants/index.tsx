import { useFieldArray } from 'react-hook-form';

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

import { VariantOptionBadge } from '../../../variants-options-badge';
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
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Imagens</TableHead>
              <TableHead>Atributos</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Estoque mínimo</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {fields.map((field, index) => (
              <TableRow key={field.id}>
                <TableCell className="flex gap-1">
                  <ProductFormFieldVariantImages variantIndex={index} />
                </TableCell>

                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {field.options?.map((option) => (
                      <VariantOptionBadge
                        key={`${option.name}-${option.value}`}
                        option={option}
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
                            placeholder="SKU da variação"
                            disabled={mode !== 'Create'}
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
                              field.onChange(value === '' ? 0 : Number(value));
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
