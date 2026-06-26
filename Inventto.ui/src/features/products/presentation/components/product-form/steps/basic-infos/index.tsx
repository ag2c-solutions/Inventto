import { CheckCircle2, Loader2 } from 'lucide-react';

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/shared/components/ui/form';
import { Input } from '@/shared/components/ui/input';
import { Switch } from '@/shared/components/ui/switch';
import { Textarea } from '@/shared/components/ui/textarea';
import { cn } from '@/shared/utils';

import { useProductForm } from '../../hook';

import { ProductFormFieldCategory } from './field-category';

export function ProductBasicInfo() {
  const {
    form,
    mode,
    handleNameChange,
    handleVariantSwitch,
    skuAvailabilityStatus
  } = useProductForm();

  const hasVariants = form.watch('hasVariants');

  return (
    <div className="flex flex-col gap-6 pb-6">
      <div>
        <h2 className="text-xl font-semibold">Informações básicas</h2>
        <p className="text-sm text-muted-foreground">
          Dados essenciais do produto. O custo entra depois, pela primeira
          movimentação.
        </p>
      </div>

      <FormField
        control={form.control}
        name={'name'}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nome</FormLabel>
            <FormControl>
              <Input
                placeholder="Ex: Vestido Linho Areia"
                disabled={mode !== 'Create'}
                {...field}
                onChange={(e) => handleNameChange(e.target.value)}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name={'sku'}
        render={({ field }) => (
          <FormItem>
            <FormLabel>SKU</FormLabel>
            <div className="relative">
              <FormControl>
                <Input
                  placeholder="Código único do produto"
                  className={cn(
                    'uppercase pr-9',
                    skuAvailabilityStatus === 'duplicate' &&
                      'border-destructive focus-visible:ring-destructive'
                  )}
                  disabled={mode !== 'Create'}
                  {...field}
                />
              </FormControl>
              {skuAvailabilityStatus === 'checking' && (
                <Loader2
                  aria-label="Checando disponibilidade"
                  className="absolute right-2.5 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground"
                />
              )}
              {skuAvailabilityStatus === 'available' && (
                <CheckCircle2
                  aria-label="SKU disponível"
                  className="absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-emerald-600"
                />
              )}
            </div>
            {skuAvailabilityStatus === 'duplicate' ? (
              <p className="text-sm font-medium text-destructive">
                Já existe um produto com este SKU.
              </p>
            ) : (
              <FormDescription>
                Identificador único por organização. Validado em tempo real.
              </FormDescription>
            )}
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name={'description'}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Descrição</FormLabel>
            <FormControl>
              <Textarea
                className="resize-y min-h-[96px]"
                placeholder="Opcional"
                {...field}
                value={field.value ?? ''}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <ProductFormFieldCategory />

      <FormField
        control={form.control}
        name={'hasVariants'}
        render={({ field }) => (
          <FormItem>
            <div className="flex items-center justify-between gap-4 rounded-lg border px-4 py-3">
              <div className="space-y-0.5">
                <FormLabel>Este produto tem variações</FormLabel>
                <FormDescription className="text-xs sm:text-sm">
                  Gera uma grade de variantes (cor, tamanho…) — cada uma com SKU
                  e estoque mínimo próprios.
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={handleVariantSwitch}
                  disabled={
                    mode === 'Edit' &&
                    !form.getFieldState('hasVariants').isDirty &&
                    field.value === true
                  }
                />
              </FormControl>
            </div>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name={'minimumStock'}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Estoque mínimo</FormLabel>
            <FormControl>
              <Input
                type="number"
                step="1"
                inputMode="numeric"
                placeholder={hasVariants ? 'Definido por variante' : 'Opcional'}
                disabled={hasVariants}
                {...field}
                onChange={(event) => {
                  const value = event.target.value;
                  field.onChange(value === '' ? 0 : Number(value));
                }}
                value={hasVariants ? '' : (field.value ?? '')}
              />
            </FormControl>
            <FormDescription>
              {hasVariants
                ? 'Com variações ativas, o estoque mínimo é definido por variante na etapa "Variações".'
                : 'Abaixo deste saldo, o produto entra em estado Crítico.'}
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
