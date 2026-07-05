import { useState } from 'react';
import { Link } from 'react-router';
import { Eye, EyeOff } from 'lucide-react';

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

import { maskEmail } from '../../../utils/mask-email';
import { OtpStep } from '../../otp-step';

import { useSignInForm } from './hooks/use-sign-in-form';

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

  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="w-full max-w-[480px] mx-auto">
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
        <div className="flex flex-col space-y-6">
          <div className="flex flex-col space-y-2 text-left">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Bem-vindo ao{' '}
              <span className="font-philosopher text-primary text-4xl">
                Inventto
              </span>
              !
            </h1>
            <p className="text-[16px] text-muted-foreground pb-2">
              Acesse sua conta para gerenciar sua loja, estoques e pedidos.
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-base font-semibold">
                      E-mail cadastrado
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="voce@email.com"
                        type="email"
                        disabled={form.formState.isSubmitting}
                        className="h-12 text-base px-4 rounded-xl"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-[#A24444]" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <div className="flex items-center justify-between">
                      <FormLabel className="text-base font-semibold">
                        Senha de acesso
                      </FormLabel>
                      <Link
                        to="/auth/forgot-password"
                        className="text-[15px] text-foreground underline underline-offset-4 hover:text-primary transition-colors"
                        tabIndex={-1}
                      >
                        Esqueceu a senha?
                      </Link>
                    </div>
                    <div className="relative">
                      <FormControl>
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="........"
                          disabled={form.formState.isSubmitting}
                          className="h-12 text-base px-4 pr-12 rounded-xl  font-sans tracking-widest placeholder:tracking-widest"
                          {...field}
                        />
                      </FormControl>
                      <button
                        type="button"
                        tabIndex={-1}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                        <span className="sr-only">
                          {showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                        </span>
                      </button>
                    </div>
                    <FormMessage className="text-[#A24444]" />
                  </FormItem>
                )}
              />
              <SubmittingButton
                type="submit"
                size={'lg'}
                className="w-full text-base font-semibold rounded-xl"
                label="Entrar no sistema"
                state={form.formState.isSubmitting}
                loadingLabel="Entrando..."
              />
            </form>
          </Form>

          <div className="text-center text-[15px] text-muted-foreground">
            Não tem uma conta?{' '}
            <Link
              to="/auth/register"
              className="text-foreground underline underline-offset-4 font-medium hover:text-primary transition-colors"
            >
              Cadastre-se
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
