import { Link } from 'react-router';
import type { UseFormReturn } from 'react-hook-form';

import { SubmittingButton } from '@/shared/components/common/submitting-button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/shared/components/ui/form';
import { Input } from '@/shared/components/ui/input';

import type { RecoverPasswordFormData } from './schema';

interface EmailStepProps {
  form: UseFormReturn<RecoverPasswordFormData>;
  onSubmit: (data: RecoverPasswordFormData) => void;
}

export function EmailStep({ form, onSubmit }: EmailStepProps) {
  const isSubmitting = form.formState.isSubmitting;

  return (
    <div className="w-full">
      <div className="space-y-8">
        <div className="space-y-2 text-left">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Recuperar senha
          </h2>
          <p className="text-[15px] text-muted-foreground leading-relaxed">
            Digite seu e-mail de cadastro e enviaremos um código para você
            redefinir sua senha de acesso.
          </p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="space-y-2 text-left">
                  <FormLabel className="text-base font-semibold">
                    E-mail cadastrado
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="voce@email.com"
                      type="email"
                      disabled={isSubmitting}
                      className="h-12 text-base px-4 rounded-xl border-slate-300"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-[#A24444]" />
                </FormItem>
              )}
            />
            <div className="flex flex-col items-center gap-6 pt-2">
              <SubmittingButton
                className="w-full h-10 text-base font-semibold rounded-xl"
                state={isSubmitting}
                label="Enviar código"
                loadingLabel="Enviando..."
              />

              <Link
                to="/auth/login"
                className="text-[15px] font-medium text-muted-foreground underline underline-offset-4 hover:text-foreground transition-colors"
              >
                Voltar para o Login
              </Link>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
