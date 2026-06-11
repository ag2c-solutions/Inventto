import { Link } from 'react-router';
import { Loader2, Mail } from 'lucide-react';

import { Logo } from '@/app/brand/logo';

import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader
} from '@/shared/components/ui/card';
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
    <Card className="w-full max-w-md">
      <CardHeader className="w-11/12 text-center flex flex-col items-center justify-center">
        <Logo />
      </CardHeader>
      <CardContent>
        {isSent ? (
          <div className="flex flex-col items-center gap-5 pt-4 text-center">
            <div
              className="flex items-center justify-center size-16 rounded-full bg-muted"
              aria-hidden="true"
            >
              <Mail className="size-7 text-muted-foreground" />
            </div>
            <div className="flex flex-col items-center gap-1">
              <h2 className="text-2xl font-bold tracking-tight">
                Verifique seu e-mail
              </h2>
              <p className="text-sm text-muted-foreground">
                Se houver uma conta associada a este endereço de e-mail, as
                instruções de redefinição foram enviadas.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-1 text-center">
              <h2 className="text-2xl font-bold tracking-tight">
                Recuperar senha
              </h2>
              <p className="text-sm text-muted-foreground">
                Digite seu e-mail de cadastro e enviaremos as instruções para
                você redefinir sua senha de acesso.
              </p>
            </div>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-mail cadastrado</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="voce@email.com"
                          type="email"
                          disabled={form.formState.isSubmitting}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {form.formState.isSubmitting
                    ? 'Enviando…'
                    : 'Enviar instruções de redefinição'}
                </Button>
              </form>
            </Form>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-center">
        <Link to="/auth/login" className="text-sm text-primary hover:underline">
          Voltar para o Login
        </Link>
      </CardFooter>
    </Card>
  );
}
