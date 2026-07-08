import { Tag } from 'lucide-react';
import { Controller, type UseFormReturn } from 'react-hook-form';

import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';
import { MoneyInput } from '@/shared/components/ui/money-input';

import type { ConfigurePricesFormValues } from '@/features/catalogs/domain/validators';

// Único par de caminhos que este campo realmente recebe: originalPrice do
// produto (priceMode 'single') ou de uma variante específica (per_variant).
export type OriginalPriceFieldName =
  | `items.${number}.originalPrice`
  | `items.${number}.variants.${number}.originalPrice`;

interface OriginalPriceFieldProps {
  name: OriginalPriceFieldName;
  form: UseFormReturn<ConfigurePricesFormValues>;
  hideLabel?: boolean;
}

export function OriginalPriceField({
  name,
  form,
  hideLabel
}: OriginalPriceFieldProps) {
  const originalPrice = form.watch(name);
  const showField = originalPrice !== null && originalPrice !== undefined;

  return showField ? (
    <div className="flex flex-col gap-1.5">
      {!hideLabel && (
        <Label className="text-xs text-muted-foreground">
          Preço original (antes da promoção)
        </Label>
      )}
      <Controller
        control={form.control}
        name={name}
        render={({ field }) => (
          <div className="flex items-center rounded-md border bg-background overflow-hidden">
            <span className="px-3 text-sm text-muted-foreground border-r bg-muted h-full flex items-center shrink-0">
              R$
            </span>
            <MoneyInput
              placeholder="0,00"
              className="border-0 shadow-none focus-visible:ring-0"
              value={field.value}
              onChange={(cents: number | null) => field.onChange(cents)}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="mr-1 shrink-0"
              onClick={() => form.setValue(name, null)}
            >
              Remover
            </Button>
          </div>
        )}
      />
    </div>
  ) : (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="w-fit text-muted-foreground hover:text-foreground -ml-2"
      onClick={() => form.setValue(name, 0)}
    >
      <Tag className="size-3.5 mr-1.5" />
      Adicionar promoção
    </Button>
  );
}
