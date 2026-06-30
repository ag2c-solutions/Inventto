import { useFieldArray } from 'react-hook-form';

import {
  FormControl,
  FormField,
  FormItem,
  FormMessage
} from '@/shared/components/ui/form';
import { Input } from '@/shared/components/ui/input';
import { cn } from '@/shared/utils';

import { useProductForm } from '../../hook';

import { ProductFormFieldVariantImages } from './field-variant-images';

export function ProductVariants() {
  const { form, mode, hasMovements } = useProductForm();

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
    <div className="overflow-hidden rounded-xl border">
      <div className="flex items-center justify-between border-b bg-muted/40 px-4 py-3">
        <span className="text-sm font-bold">Grade de variantes</span>

        <span className="font-mono text-xs text-muted-foreground">
          {fields.length}{' '}
          {fields.length === 1 ? 'variante gerada' : 'variantes geradas'}
        </span>
      </div>

      <div className="hidden items-center gap-3 border-b px-4 py-2 text-[10.5px] font-semibold uppercase tracking-wide text-muted-foreground md:flex">
        <span className="w-[200px] shrink-0">Variante</span>
        <span className="w-[150px] shrink-0">SKU</span>
        <span className="w-20 shrink-0">Estoque mín.</span>
        <span className="ml-auto">Imagem</span>
      </div>

      {fields.map((field, index) => {
        const label = field.options?.map((option) => option.value).join(' · ');

        return (
          <div
            key={field.id}
            className={cn(
              'flex flex-col gap-3 px-4 py-3 md:flex-row md:items-center',
              index < fields.length - 1 && 'border-b'
            )}
          >
            <span className="shrink-0 text-sm font-semibold md:w-[200px]">
              {label}
            </span>

            <div className="grid grid-cols-2 gap-3 md:contents">
              <div className="md:w-[150px] md:shrink-0">
                <FormField
                  control={form.control}
                  name={`variants.${index}.sku`}
                  render={({ field }) => (
                    <FormItem>
                      <span className="mb-1 block text-[10.5px] font-semibold uppercase tracking-wide text-muted-foreground md:hidden">
                        SKU
                      </span>
                      <FormControl>
                        <Input
                          className="font-mono"
                          placeholder="SKU da variação"
                          disabled={mode === 'Edit' && hasMovements}
                          {...field}
                        />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="md:w-20 md:shrink-0">
                <FormField
                  control={form.control}
                  name={`variants.${index}.minimumStock`}
                  render={({ field }) => (
                    <FormItem>
                      <span className="mb-1 block text-[10.5px] font-semibold uppercase tracking-wide text-muted-foreground md:hidden">
                        Estoque mín.
                      </span>
                      <FormControl>
                        <Input
                          type="number"
                          step="1"
                          className="font-mono"
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
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 md:ml-auto md:justify-end">
              <ProductFormFieldVariantImages variantIndex={index} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
