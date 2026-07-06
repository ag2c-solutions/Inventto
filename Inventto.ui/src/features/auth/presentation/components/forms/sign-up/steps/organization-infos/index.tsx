import { Controller } from 'react-hook-form';

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/shared/components/ui/form';
import { Input } from '@/shared/components/ui/input';

import { BusinessAreaButtonGroup } from '../../../../business-area';
import { useSignUpForm } from '../../hooks/use-sign-up-form';

export function OrganizationStep() {
  const { form, isCnpj, actions } = useSignUpForm();

  return (
    <div className="flex w-full flex-col space-y-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[15px] font-medium text-muted-foreground">
          Passo 1 de 3
        </span>
      </div>

      <div className="flex flex-col space-y-2 text-left">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Crie sua conta
        </h1>
        <p className="text-[15px] text-muted-foreground pb-2">
          Vamos começar configurando o seu negócio. Leva menos de um minuto.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <FormField
          control={form.control}
          name="companyName"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel className="text-base font-semibold">
                Nome fantasia da organização
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Ex: Loja Inventto Matriz"
                  className="h-12 text-base px-4 rounded-xl border-slate-300"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-[#A24444]" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="document"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel className="text-base font-semibold">
                Documento (CPF ou CNPJ)
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="000.000.000-00 ou 00.000.000/0000-00"
                  className="h-12 text-base px-4 rounded-xl border-slate-300 font-mono tracking-wider"
                  {...field}
                  maxLength={18}
                  onChange={(e) => {
                    actions.handleDocumentChange(e.target.value);
                  }}
                />
              </FormControl>
              <FormMessage className="text-[#A24444]" />
            </FormItem>
          )}
        />

        {isCnpj && (
          <FormField
            control={form.control}
            name="corporateName"
            render={({ field }) => (
              <FormItem className="animate-in zoom-in-95 duration-200 space-y-2">
                <FormLabel className="text-base font-semibold">
                  Razão Social
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Razão Social Ltda"
                    className="h-12 text-base px-4 rounded-xl border-slate-300"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-[#A24444]" />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="businessAreaCode"
          render={() => (
            <FormItem>
              <FormLabel>Área de atuação</FormLabel>
              <Controller
                control={form.control}
                name="businessAreaCode"
                render={({ field, fieldState }) => (
                  <BusinessAreaButtonGroup
                    value={field.value}
                    onChange={field.onChange}
                    errorMessage={fieldState.error?.message}
                  />
                )}
              />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
