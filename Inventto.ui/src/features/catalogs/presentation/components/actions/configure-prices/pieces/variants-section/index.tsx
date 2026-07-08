import { Controller, useFieldArray, type UseFormReturn } from 'react-hook-form';

import { Checkbox } from '@/shared/components/ui/checkbox';
import { Label } from '@/shared/components/ui/label';
import { MoneyInput } from '@/shared/components/ui/money-input';
import { cn } from '@/shared/utils';

import type { ConfigurePricesFormValues } from '@/features/catalogs/domain/validators';
import type { AvailableProduct } from '@/features/catalogs/presentation/hooks/use-queries';
import { VariantOptionBadge } from '@/features/products';

import { OriginalPriceField } from '../original-price-field';

interface VariantsSectionProps {
  index: number;
  form: UseFormReturn<ConfigurePricesFormValues>;
  product: AvailableProduct;
  priceMode: 'single' | 'per_variant';
}

export function VariantsSection({
  index,
  form,
  product,
  priceMode
}: VariantsSectionProps) {
  const { fields: variantFields } = useFieldArray({
    control: form.control,
    name: `items.${index}.variants`
  });

  const includedCount = variantFields.filter((_, vIndex) =>
    form.watch(`items.${index}.variants.${vIndex}.included`)
  ).length;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Variantes no catálogo
        </Label>
        <span className="text-xs text-muted-foreground">
          {includedCount} de {variantFields.length}
        </span>
      </div>

      <div className="rounded-md border bg-muted/30 flex flex-col divide-y">
        {variantFields.map((variantField, vIndex) => {
          const variant = product.variants[vIndex];
          if (!variant) return null;

          const isIncluded = form.watch(
            `items.${index}.variants.${vIndex}.included`
          );

          return (
            <div
              key={variantField.id}
              className={cn(
                'flex items-center gap-3 px-3 py-2 transition-opacity',
                !isIncluded && 'opacity-50'
              )}
            >
              <Controller
                control={form.control}
                name={`items.${index}.variants.${vIndex}.included`}
                render={({ field }) => (
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="data-[state=checked]:bg-foreground data-[state=checked]:border-foreground"
                  />
                )}
              />

              {variant.imageUrl && (
                <img
                  src={variant.imageUrl}
                  alt={variant.sku}
                  className="size-10 shrink-0 rounded-md object-cover border"
                />
              )}

              <div className="flex flex-col gap-1 text-sm flex-1">
                {variant.options.map((o) => (
                  <VariantOptionBadge key={o.name} option={o} />
                ))}
              </div>

              {priceMode === 'per_variant' && isIncluded && (
                <div className="flex flex-col items-center gap-2">
                  <Controller
                    control={form.control}
                    name={`items.${index}.variants.${vIndex}.price`}
                    render={({ field, fieldState }) => (
                      <div
                        className={cn(
                          'flex items-center rounded-md border bg-background overflow-hidden w-48 shrink-0',
                          fieldState.error && 'border-destructive'
                        )}
                      >
                        <span className="px-2 text-xs text-muted-foreground border-r bg-muted h-full flex items-center shrink-0">
                          R$
                        </span>
                        <MoneyInput
                          placeholder="0,00"
                          className="border-0 shadow-none focus-visible:ring-0 h-8 text-sm"
                          value={field.value}
                          onChange={(cents: number | null) =>
                            field.onChange(cents ?? undefined)
                          }
                        />
                      </div>
                    )}
                  />
                  <div className="w-48">
                    <OriginalPriceField
                      name={`items.${index}.variants.${vIndex}.originalPrice`}
                      form={form}
                      hideLabel={true}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
