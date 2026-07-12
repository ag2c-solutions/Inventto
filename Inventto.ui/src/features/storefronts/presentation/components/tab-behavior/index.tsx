import type { UseFormReturn } from 'react-hook-form';

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/shared/components/ui/form';
import { Switch } from '@/shared/components/ui/switch';
import { Textarea } from '@/shared/components/ui/textarea';

import type { StorefrontConfigFormValues } from '../../../domain/validators';
import { FeaturedList } from '../featured-list';

interface TabBehaviorProps {
  form: UseFormReturn<StorefrontConfigFormValues>;
  storefrontId?: string;
  isSaving: boolean;
}

export function TabBehavior({
  form,
  storefrontId,
  isSaving
}: TabBehaviorProps) {
  const catalogId = form.watch('catalogId');

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <h3 className="text-base font-medium text-sidebar-foreground/70 uppercase">
          Exibição
        </h3>

        <FormField
          control={form.control}
          name="behavior.showPrices"
          render={({ field }) => (
            <FormItem className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <FormLabel className="text-foreground">
                  Mostrar preços
                </FormLabel>
                <FormDescription>
                  Quando desativado, o cliente vê "Consultar" e é direcionado ao
                  WhatsApp.
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isSaving}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="behavior.showSoldOut"
          render={({ field }) => (
            <FormItem className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <FormLabel className="text-foreground">
                  Mostrar produtos esgotados
                </FormLabel>
                <FormDescription>
                  Produtos zerados aparecem como "Esgotado" na vitrine.
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isSaving}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </section>

      <section className="space-y-4">
        <h3 className="text-base font-medium text-sidebar-foreground/70 uppercase">
          Mensagem de WhatsApp
        </h3>

        <FormField
          control={form.control}
          name="behavior.whatsappMessage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mensagem pré-preenchida (opcional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Olá! Vi sua vitrine e gostaria de fazer um pedido."
                  className="resize-y"
                  disabled={isSaving}
                  {...field}
                  value={field.value ?? ''}
                />
              </FormControl>
              <FormDescription>
                Texto que abre na conversa quando o cliente inicia um pedido.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </section>

      <section className="space-y-4">
        <h3 className="text-base font-medium text-sidebar-foreground/70 uppercase">
          Destaques
        </h3>
        <p className="text-sm text-muted-foreground">
          Destaques aparecem no topo da vitrine.
        </p>
        <FeaturedList storefrontId={storefrontId} catalogId={catalogId} />
      </section>
    </div>
  );
}
