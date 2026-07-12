import { Facebook, Globe, Instagram, MessageCircle } from 'lucide-react';
import { useController, type UseFormReturn } from 'react-hook-form';

import {
  FormControl,
  FormDescription,
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

import { useCatalogsQuery } from '@/features/catalogs';

import type { StorefrontConfigFormValues } from '../../../domain/validators';
import { SlugField } from '../slug-field';
import { useSlugAvailability } from '../slug-field/hooks/use-slug-availability';

interface TabGeneralProps {
  form: UseFormReturn<StorefrontConfigFormValues>;
  storefrontId?: string;
  isSaving: boolean;
}

export function TabGeneral({ form, storefrontId, isSaving }: TabGeneralProps) {
  const { data: catalogs } = useCatalogsQuery();
  const { field: slugField } = useController({
    control: form.control,
    name: 'slug'
  });
  const slugState = useSlugAvailability(slugField.value ?? '', storefrontId);

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <h3 className="text-base font-medium text-sidebar-foreground/70 uppercase">
          Identificação
        </h3>

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome da vitrine</FormLabel>
              <FormControl>
                <Input
                  placeholder="ex.: Vitrine Ateliê Joana"
                  disabled={isSaving}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Identifica a vitrine no app interno. Não aparece para o cliente.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="catalogId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Catálogo</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
                disabled={isSaving}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione um catálogo…" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {catalogs?.map((catalog) => (
                    <SelectItem key={catalog.id} value={catalog.id}>
                      {catalog.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Os produtos e preços vêm do catálogo selecionado.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </section>

      <section className="space-y-4">
        <h3 className="text-base font-medium text-sidebar-foreground/70 uppercase">
          Endereço público
        </h3>

        <FormItem>
          <FormLabel>Slug</FormLabel>
          <SlugField
            value={slugField.value ?? ''}
            onChange={slugField.onChange}
            onBlur={slugField.onBlur}
            state={slugState}
            disabled={isSaving}
          />
        </FormItem>
      </section>

      <section className="space-y-4">
        <h3 className="text-base font-medium text-sidebar-foreground/70 uppercase">
          Contato
        </h3>

        <FormField
          control={form.control}
          name="whatsapp"
          render={({ field }) => (
            <FormItem>
              <FormLabel>WhatsApp</FormLabel>
              <FormControl>
                <div className="relative">
                  <MessageCircle className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="(11) 90000-0000"
                    className="pl-9 font-mono"
                    disabled={isSaving}
                    {...field}
                  />
                </div>
              </FormControl>
              <FormDescription>
                Usado para receber pedidos e contatos da vitrine.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="instagram"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Instagram (opcional)</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Instagram className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="@usuario"
                      className="pl-9"
                      disabled={isSaving}
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="facebook"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Facebook (opcional)</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Facebook className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="/pagina"
                      className="pl-9"
                      disabled={isSaving}
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="website"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Site (opcional)</FormLabel>
              <FormControl>
                <div className="relative">
                  <Globe className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="https://"
                    className="pl-9"
                    disabled={isSaving}
                    {...field}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </section>
    </div>
  );
}
