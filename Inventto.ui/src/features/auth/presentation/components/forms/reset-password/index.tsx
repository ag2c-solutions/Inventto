import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { CheckCircle, Eye, EyeOff } from 'lucide-react';

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

import { useResetPasswordForm } from './use-reset-password-form';

export function ResetPasswordForm() {
  const navigate = useNavigate();
  const { form, onSubmit, isPending, isSuccess } = useResetPasswordForm();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        navigate('/auth/login', { replace: true });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, navigate]);

  return (
    <div className="w-full">
      {isSuccess ? (
        <div className="flex flex-col items-center gap-6 text-center max-w-[480px] mx-auto pt-8">
          <div className="w-full bg-[#6c8567] text-white rounded-2xl py-6 px-6 flex items-center justify-center gap-4 shadow-sm">
            <CheckCircle
              className="size-6 text-white shrink-0"
              strokeWidth={1.5}
            />
            <span className="text-[17px] font-medium leading-relaxed">
              Senha redefinida. Faça login com suas novas credenciais.
            </span>
          </div>
          <div className="mt-4">
            <p className="text-[17px] text-[#b0aca6]">
              Redirecionando para{' '}
              <span className="underline underline-offset-4">/login</span>...
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="flex justify-between items-start mb-6">
            <div className="text-[15px] font-medium text-[#b0aca6]">
              Acesso por
              <br />
              token
            </div>
          </div>
          <div className="space-y-2 text-left">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">
              Defina sua nova senha
            </h2>
            <p className="text-[15px] text-muted-foreground leading-relaxed">
              Crie uma senha forte para proteger sua conta.
            </p>
          </div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="space-y-2 text-left">
                    <FormLabel className="text-base font-semibold">
                      Nova senha
                    </FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          disabled={isPending}
                          className="h-12 text-base px-4 pr-12 rounded-xl border-slate-300 font-sans tracking-widest placeholder:tracking-widest"
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
                    <p className="text-[13px] text-[#b0aca6] leading-relaxed">
                      Mínimo de 8 caracteres, com letra maiúscula, minúscula,
                      número e caractere especial.
                    </p>
                    <FormMessage className="text-[#A24444]" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem className="space-y-2 text-left">
                    <FormLabel className="text-base font-semibold">
                      Confirmar nova senha
                    </FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="Digite a senha novamente"
                          disabled={isPending}
                          className="h-12 text-base px-4 pr-12 rounded-xl border-slate-300"
                          {...field}
                        />
                      </FormControl>
                      <button
                        type="button"
                        tabIndex={-1}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                        <span className="sr-only">
                          {showConfirmPassword
                            ? 'Ocultar senha'
                            : 'Mostrar senha'}
                        </span>
                      </button>
                    </div>
                    <FormMessage className="text-[#A24444]" />
                  </FormItem>
                )}
              />
              <div className="flex flex-col items-center gap-6 pt-2">
                <SubmittingButton
                  className="w-full h-12 text-base font-semibold rounded-xl"
                  state={isPending}
                  label="Redefinir senha"
                  loadingLabel="Salvando..."
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
      )}
    </div>
  );
}
