import { Link } from 'react-router';
import { Loader2 } from 'lucide-react';

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

import { maskEmail } from '../../../utils/mask-email';
import { OtpStep } from '../../otp-step';

import { useSignInForm } from './use-sign-in-form';

export function SignInForm() {
  const {
    form,
    onSubmit,
    pendingEmail,
    isVerifying,
    verifyErrorMessage,
    handleVerifyOtp,
    handleResendOtp,
    handleBackToCredentials
  } = useSignInForm();

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="w-11/12 text-center flex flex-col items-center justify-center">
        <Logo />
      </CardHeader>
      <CardContent>
        {pendingEmail ? (
          <OtpStep
            title="Confirme seu e-mail"
            sub={`Você precisa confirmar seu e-mail para acessar. Enviamos um código de 6 dígitos para ${maskEmail(pendingEmail)}.`}
            ctaLabel="Confirmar e entrar"
            showBack={true}
            backLabel="Voltar para o e-mail"
            isSending={isVerifying}
            errorMessage={verifyErrorMessage}
            onSubmit={handleVerifyOtp}
            onResend={handleResendOtp}
            onBack={handleBackToCredentials}
          />
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="seu@email.com"
                        type="email"
                        disabled={form.formState.isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Senha</FormLabel>
                      <Link
                        to="/auth/forgot-password"
                        className="text-sm text-muted-foreground hover:text-primary"
                        tabIndex={-1}
                      >
                        Esqueceu a senha?
                      </Link>
                    </div>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="********"
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
                {form.formState.isSubmitting ? 'Entrando…' : 'Entrar'}
              </Button>
            </form>
          </Form>
        )}
      </CardContent>
      {!pendingEmail && (
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            Não tem uma conta?{' '}
            <Link to="/auth/register" className="text-primary hover:underline">
              Cadastre-se
            </Link>
          </p>
        </CardFooter>
      )}
    </Card>
  );
}
