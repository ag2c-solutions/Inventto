import { Loader2 } from 'lucide-react';

import { Button } from '@/shared/components/ui/button';
import { Checkbox } from '@/shared/components/ui/checkbox';
import {
  Form,
  FormControl,
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
import { Separator } from '@/shared/components/ui/separator';
import { Switch } from '@/shared/components/ui/switch';

import { useCreateOrganizationMutation } from '@/features/organizations/presentation/hooks/use-mutations';
import type { UserOrganization } from '@/features/users';

import type { CreateOrganizationFormValues } from '../../../../domain/validators';
import { REPLICATION_OPTIONS } from '../../../constants/replication-options';

import { useCreateOrganizationForm } from './hooks/use-create-organization-form';

interface CreateOrgFormProps {
  otherOrganizations: UserOrganization[];
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function CreateOrgForm({
  otherOrganizations,
  onSuccess,
  onCancel
}: CreateOrgFormProps) {
  const hasOtherOrgs = otherOrganizations.length >= 1;

  const { mutateAsync: createOrg, isPending } = useCreateOrganizationMutation();

  const {
    form,
    copySettings,
    handleDocumentChange,
    handleCopySettingsToggle,
    handleCancel
  } = useCreateOrganizationForm({ onSuccess, onCancel });

  const onSubmit = async (data: CreateOrganizationFormValues) => {
    await createOrg({
      name: data.name,
      document: data.document || undefined,
      sourceOrgId: data.copySettings ? data.sourceOrgId : undefined,
      replicateGroups: data.copySettings ? data.replicateGroups : undefined
    });

    form.reset();
    onSuccess?.();
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-5"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome fantasia</FormLabel>
              <FormControl>
                <Input
                  id="create-org-name"
                  placeholder="Ex: Loja Shopping Norte"
                  disabled={isPending}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="document"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Documento (CPF ou CNPJ)</FormLabel>
              <FormControl>
                <Input
                  id="create-org-document"
                  placeholder="00.000.000/0000-00"
                  disabled={isPending}
                  {...field}
                  onChange={(e) => {
                    handleDocumentChange(e.target.value);
                  }}
                  value={field.value ?? ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {hasOtherOrgs && (
          <>
            <Separator />

            <FormField
              control={form.control}
              name="copySettings"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between">
                  <FormLabel className="text-sm font-normal cursor-pointer">
                    Copiar configurações de outra unidade
                  </FormLabel>
                  <FormControl>
                    <Switch
                      id="create-org-copy-settings"
                      checked={field.value}
                      onCheckedChange={handleCopySettingsToggle}
                      disabled={isPending}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {copySettings && (
              <div className="flex flex-col gap-4">
                <FormField
                  control={form.control}
                  name="sourceOrgId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Organização de origem</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={isPending}
                      >
                        <FormControl>
                          <SelectTrigger id="create-org-source">
                            <SelectValue placeholder="Selecione uma organização" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {otherOrganizations.map((org) => (
                            <SelectItem key={org.id} value={org.id}>
                              {org.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="replicateGroups"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex flex-col gap-3">
                        {REPLICATION_OPTIONS.map((option) => {
                          const isChecked = field.value?.includes(option.value);
                          return (
                            <label
                              key={option.value}
                              className="flex items-center gap-3 cursor-pointer"
                            >
                              <Checkbox
                                id={`create-org-group-${option.value}`}
                                checked={isChecked}
                                disabled={isPending}
                                onCheckedChange={(checked) => {
                                  const current = field.value ?? [];
                                  if (checked) {
                                    field.onChange([...current, option.value]);
                                  } else {
                                    field.onChange(
                                      current.filter((g) => g !== option.value)
                                    );
                                  }
                                }}
                              />
                              <span className="text-sm">{option.label}</span>
                            </label>
                          );
                        })}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <p className="text-sm text-muted-foreground">
                  Estoque, produtos, equipe e pedidos nunca são copiados.
                </p>
              </div>
            )}
          </>
        )}

        <div className="flex justify-end gap-3 pt-4 mt-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2
                  data-icon="inline-start"
                  className="animate-spin mr-2"
                />
                Criando…
              </>
            ) : (
              'Criar organização'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
