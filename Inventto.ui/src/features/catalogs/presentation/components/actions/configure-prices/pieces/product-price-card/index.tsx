import { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Controller, type UseFormReturn } from 'react-hook-form';

import {
  Avatar,
  AvatarFallback,
  AvatarImage
} from '@/shared/components/ui/avatar';
import { Badge } from '@/shared/components/ui/badge';
import { Label } from '@/shared/components/ui/label';
import { MoneyInput } from '@/shared/components/ui/money-input';
import { cn } from '@/shared/utils';

import type { ConfigurePricesFormValues } from '@/features/catalogs/domain/validators';
import type { AvailableProduct } from '@/features/catalogs/presentation/hooks/use-queries';

import { OriginalPriceField } from '../original-price-field';
import { VariantsSection } from '../variants-section';

interface ProductPriceCardProps {
  index: number;
  product: AvailableProduct;
  form: UseFormReturn<ConfigurePricesFormValues>;
}

export function ProductPriceCard({
  index,
  product,
  form
}: ProductPriceCardProps) {
  const price = form.watch(`items.${index}.price`);
  const priceMode = form.watch(`items.${index}.priceMode`);
  const variants = form.watch(`items.${index}.variants`) ?? [];

  // Quando o modo é 'single', replica o preço único para o campo de cada variante
  // para que o payload e a validação do Zod sejam sempre consistentes.
  useEffect(() => {
    if (priceMode !== 'single' || !product.hasVariants) return;
    variants.forEach((_, vIndex) => {
      form.setValue(`items.${index}.variants.${vIndex}.price`, price, {
        shouldValidate: false,
        shouldDirty: false
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [price, priceMode]);

  const isConfigured = (() => {
    if (product.hasVariants) {
      const included = variants.filter((v) => v.included);
      if (included.length === 0) return false;

      if (priceMode === 'single') {
        return price !== undefined && price > 0;
      }
      return included.every((v) => v.price !== undefined && v.price > 0);
    }
    return price !== undefined && price > 0;
  })();

  const [isOpen, setIsOpen] = useState(!isConfigured);

  const subtitle = product.hasVariants
    ? `${product.variants.length} variante(s) · ${priceMode === 'per_variant' ? 'preço por variante' : 'mesmo preço para todas'}`
    : isConfigured
      ? 'Preço definido'
      : 'Defina o preço de venda';

  return (
    <div
      className={cn(
        'rounded-lg border bg-card transition-colors',
        isConfigured && 'border-emerald-200 bg-emerald-50/30'
      )}
    >
      <button
        type="button"
        className="w-full flex items-center gap-3 p-3 text-left"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span
          className={cn(
            'size-2 rounded-full flex-shrink-0 transition-colors',
            isConfigured ? 'bg-emerald-500' : 'bg-amber-400'
          )}
        />

        <Avatar className="size-9 rounded-md flex-shrink-0">
          {product.imageUrl && (
            <AvatarImage
              src={product.imageUrl}
              alt={product.name}
              className="object-cover"
            />
          )}
          <AvatarFallback className="rounded-md text-[10px]">
            IMG
          </AvatarFallback>
        </Avatar>

        <div className="flex flex-col flex-1 min-w-0">
          <span className="text-sm font-medium truncate">{product.name}</span>
          <span className="text-xs text-muted-foreground">{subtitle}</span>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={cn(
              'size-4 rounded-full border-2 flex-shrink-0',
              isConfigured
                ? 'border-emerald-500 bg-emerald-500'
                : 'border-muted-foreground/40'
            )}
          />
          {isOpen ? (
            <ChevronUp className="size-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="size-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {isOpen && (
        <div className="px-3 pb-3 flex flex-col gap-3 border-t pt-3">
          {product.hasVariants && (
            <Controller
              control={form.control}
              name={`items.${index}.priceMode`}
              render={({ field }) => (
                <div className="grid grid-cols-2 gap-2">
                  {(
                    [
                      { value: 'single', label: 'Mesmo preço para todas' },
                      { value: 'per_variant', label: 'Preço por variante' }
                    ] as const
                  ).map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => field.onChange(option.value)}
                      className={cn(
                        'flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors',
                        field.value === option.value
                          ? 'border-foreground bg-foreground text-background'
                          : 'border-border text-foreground hover:bg-muted'
                      )}
                    >
                      <span
                        className={cn(
                          'size-3.5 rounded-full border-2 flex-shrink-0',
                          field.value === option.value
                            ? 'border-background bg-background'
                            : 'border-muted-foreground'
                        )}
                      />
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            />
          )}

          {(!product.hasVariants || priceMode === 'single') && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Preço de venda
                </Label>
                <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                  OBRIGATÓRIO
                </Badge>
              </div>
              <Controller
                control={form.control}
                name={`items.${index}.price`}
                render={({ field, fieldState }) => (
                  <div
                    className={cn(
                      'flex items-center rounded-md border bg-background overflow-hidden',
                      fieldState.error && 'border-destructive'
                    )}
                  >
                    <span className="px-3 text-sm text-muted-foreground border-r bg-muted h-full flex items-center shrink-0">
                      R$
                    </span>
                    <MoneyInput
                      placeholder="0,00"
                      className="border-0 shadow-none focus-visible:ring-0"
                      value={field.value}
                      onChange={(cents: number | null) =>
                        field.onChange(cents ?? undefined)
                      }
                    />
                  </div>
                )}
              />
              <OriginalPriceField
                name={`items.${index}.originalPrice`}
                form={form}
              />
            </div>
          )}

          {product.hasVariants && product.variants.length > 0 && (
            <VariantsSection
              index={index}
              form={form}
              product={product}
              priceMode={priceMode}
            />
          )}
        </div>
      )}
    </div>
  );
}
