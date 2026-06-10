import { Controller } from 'react-hook-form';

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/shared/components/ui/form';
import { Input } from '@/shared/components/ui/input';

import { BusinessAreaButtonGroup } from '../../../business-area-button-group';
import { useSignUpForm } from '../../hook';

export function OrganizationStep() {
  const { form, isCnpj, actions } = useSignUpForm();

  return (
    <div className="">
      <div className="mb-6">
        <h1 className="text-2xl text-green-950 font-bold">Crie sua conta</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Vamos começar configurando o seu negócio. Leva menos de um minuto.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <FormField
          control={form.control}
          name="companyName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome fantasia da organização</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Loja Inventto Matriz" {...field} />
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
                  placeholder="000.000.000-00 ou 00.000.000/0000-00"
                  {...field}
                  maxLength={18}
                  onChange={(e) => {
                    actions.handleDocumentChange(e.target.value);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {isCnpj && (
          <FormField
            control={form.control}
            name="corporateName"
            render={({ field }) => (
              <FormItem className="animate-in zoom-in-95 duration-200">
                <FormLabel>Razão Social</FormLabel>
                <FormControl>
                  <Input placeholder="Razão Social Ltda" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormItem>
          <FormLabel>Área de atuação</FormLabel>
          <Controller
            control={form.control}
            name="businessAreaId"
            render={({ field, fieldState }) => (
              <BusinessAreaButtonGroup
                value={field.value}
                onChange={field.onChange}
                errorMessage={fieldState.error?.message}
              />
            )}
          />
        </FormItem>
      </div>
    </div>
  );
}
