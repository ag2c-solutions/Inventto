import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { Button } from '@/shared/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/shared/components/ui/form';
import { Input } from '@/shared/components/ui/input';
import { generateSlug } from '@/shared/utils';

import { useCreateOrganizationMutation } from '../../hooks/use-mutations';

import type { CreateOrgData } from './schema';
import { createOrgSchema } from './schema';

interface CreateOrgFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function CreateOrgForm({ onSuccess, onCancel }: CreateOrgFormProps) {
  const { mutateAsync: createOrg, isPending } = useCreateOrganizationMutation();

  const form = useForm<CreateOrgData>({
    resolver: zodResolver(createOrgSchema),
    defaultValues: {
      name: '',
      slug: '',
      document: ''
    }
  });

  const nameValue = form.watch('name');

  useEffect(() => {
    const slugState = form.getFieldState('slug');

    if (!slugState.isDirty && nameValue) {
      form.setValue('slug', generateSlug(nameValue));
    }
  }, [nameValue, form]);

  const onSubmit = async (data: CreateOrgData) => {
    try {
      await createOrg(data);

      form.reset();

      onSuccess?.();
    } catch (error) {
      console.error('Erro ao criar organização:', error);
    }
  };

  return (
    <div className="grid gap-4 pt-4 py-2">
      <Form {...form}>
        <form className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome da Empresa</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ex: Inventto Tech"
                    {...field}
                    disabled={isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>URL da Organização (Slug)</FormLabel>
                <FormControl>
                  <div className="flex items-center">
                    <span className="text-sm text-muted-foreground mr-1">
                      app.inventto.com/
                    </span>
                    <Input {...field} disabled={isPending} />
                  </div>
                </FormControl>
                <FormDescription>
                  Identificador único usado na URL.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="document"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CNPJ / Documento (Opcional)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="00.000.000/0001-00"
                    {...field}
                    disabled={isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
      <section className="flex justify-end w-full mt-2 gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button disabled={isPending} onClick={form.handleSubmit(onSubmit)}>
          {isPending ? 'Criando...' : 'Criar Organização'}
        </Button>
      </section>
    </div>
  );
}
