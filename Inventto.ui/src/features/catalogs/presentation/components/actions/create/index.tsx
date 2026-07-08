import { useState } from 'react';

import { SubmittingButton } from '@/shared/components/common/submitting-button';
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/shared/components/ui/dialog';
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

import { ActionButton } from '@/features/permissions';

import type { CatalogFormValues } from '../../../../domain/validators';
import { useCreateCatalogMutation } from '../../../hooks/use-mutations';

import { useCreateCatalogForm } from './hooks/use-create-catalog-form';

export function CreateCatalogDialog() {
  const [open, setOpen] = useState(false);
  const { mutateAsync: createCatalog, isPending } = useCreateCatalogMutation();
  const form = useCreateCatalogForm();

  async function onSubmit(data: CatalogFormValues) {
    await createCatalog({ name: data.name });
    form.reset();
    setOpen(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) form.reset();
      }}
    >
      <DialogTrigger asChild>
        <ActionButton action="catalog:manage">Criar catálogo</ActionButton>
      </DialogTrigger>
      <DialogContent className="w-full max-w-md! p-6">
        <DialogHeader>
          <DialogTitle>Novo catálogo</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-6"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="py-1.5">Nome do catálogo</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nome do catálogo"
                      disabled={isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Um nome interno para você organizar. Os canais escolhem qual
                    catálogo usar.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="grid grid-cols-2">
              <Button
                type="button"
                variant="outline"
                disabled={isPending}
                className="w-full"
                onClick={() => setOpen(false)}
              >
                Cancelar
              </Button>
              <SubmittingButton
                state={isPending}
                className="w-full"
                label="Criar catálogo"
                loadingLabel="Criando..."
              />
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
