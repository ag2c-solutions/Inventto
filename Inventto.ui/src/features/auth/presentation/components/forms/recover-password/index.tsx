import { Link } from 'react-router';
import { Mail } from 'lucide-react';

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

import { useRecoverPasswordForm } from './use-recover-password-form';

export function RecoverPasswordForm() {
  const { form, onSubmit, isSent } = useRecoverPasswordForm();

  return (
    <div className="w-full">
      {isSent ? (
        <div className="flex flex-col items-center gap-6 text-center max-w-[480px] mx-auto pt-8">
          <div className="w-full rounded-2xl border border-border bg-[#f6f5f1] py-12 px-8 flex flex-col items-center gap-6">
            <div
              className="flex items-center justify-center size-[72px] rounded-full border  bg-white"
              aria-hidden="true"
            >
              <Mail className="size-8 text-[#fef2e1] stroke-[1.5]" />
            </div>
            <div className="flex flex-col items-center gap-3">
              <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                Verifique seu e-mail
              </h2>
              <p className="text-[17px] text-[#b0aca6] leading-relaxed">
                Se houver uma conta associada a este endereço de e-mail, as
                instruções de redefinição foram enviadas.
              </p>
            </div>
          </div>
          <div className="mt-4 w-full">
            <Link
              to="/auth/login"
              className="text-[16px] font-medium text-muted-foreground underline underline-offset-4 hover:text-foreground transition-colors"
            >
              Voltar para o Login
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="space-y-8">
            <div className="space-y-2 text-left">
              <h2 className="text-3xl font-bold tracking-tight text-foreground">
                Recuperar senha
              </h2>
              <p className="text-[15px] text-muted-foreground leading-relaxed">
                Digite seu e-mail de cadastro e enviaremos as instruções para
                você redefinir sua senha de acesso.
              </p>
            </div>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
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
                          disabled={form.formState.isSubmitting}
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
                    state={form.formState.isSubmitting}
                    label="Enviar instruções de redefinição"
                    loadingLabel="Enviando..."
                  ></SubmittingButton>

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
        </>
      )}
    </div>
  );
}
