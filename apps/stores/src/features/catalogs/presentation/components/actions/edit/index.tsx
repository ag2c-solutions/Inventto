import { useState } from 'react';
import { Loader2, Pencil } from 'lucide-react';

import { Button } from '@/shared/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/shared/components/ui/form';
import { Input } from '@/shared/components/ui/input';
import { Separator } from '@/shared/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from '@/shared/components/ui/sheet';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { useIsMobile } from '@/shared/hooks/use-is-mobile';
import { cn } from '@/shared/utils';

import { ActionButton } from '@/features/permissions';

import type { CatalogFormValues } from '../../../../domain/validators';
import { useUpdateCatalogMutation } from '../../../hooks/use-mutations';
import { useCatalogByIDQuery } from '../../../hooks/use-queries';
import { LinkedChannels } from '../../linked-channels';

import { useEditCatalogForm } from './hooks/use-edit-catalog-form';

interface EditCatalogSheetProps {
  catalogId: string;
}

export function EditCatalogSheet({ catalogId }: EditCatalogSheetProps) {
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();
  const { data: catalog, isLoading } = useCatalogByIDQuery(
    open ? catalogId : ''
  );
  const { mutateAsync: updateCatalog, isPending } = useUpdateCatalogMutation();
  const form = useEditCatalogForm(catalog?.name);

  async function onSubmit(data: CatalogFormValues) {
    await updateCatalog({ id: catalogId, name: data.name });
    setOpen(false);
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <ActionButton
          action="catalog:manage"
          variant="ghost"
          size="icon-sm"
          title="Editar catálogo"
        >
          <Pencil className="h-4 w-4" />
          <span className="sr-only">Editar catálogo</span>
        </ActionButton>
      </SheetTrigger>
      <SheetContent
        side={isMobile ? 'bottom' : 'right'}
        className={cn(
          'flex flex-col gap-0 overflow-y-auto',
          isMobile && 'max-h-[85vh] rounded-t-lg'
        )}
      >
        <SheetHeader className="border-b">
          <SheetTitle>Editar catálogo</SheetTitle>
        </SheetHeader>

        {isLoading ? (
          <div className="flex flex-col gap-4 p-4">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-1 flex-col gap-4 p-4"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do catálogo</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nome do catálogo"
                        disabled={isPending}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Separator />

              <LinkedChannels channels={[]} />

              <SheetFooter className="mt-auto flex-row justify-end border-t p-4">
                <Button
                  type="button"
                  variant="ghost"
                  disabled={isPending}
                  onClick={() => setOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isLoading || isPending}>
                  {isPending ? (
                    <>
                      <Loader2 className="animate-spin" />
                      Salvando…
                    </>
                  ) : (
                    'Salvar'
                  )}
                </Button>
              </SheetFooter>
            </form>
          </Form>
        )}
      </SheetContent>
    </Sheet>
  );
}
