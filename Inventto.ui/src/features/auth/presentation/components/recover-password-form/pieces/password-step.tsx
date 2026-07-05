import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
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

import type { ResetPasswordFormValues } from '../../../../domain/validators';

interface PasswordStepProps {
  form: UseFormReturn<ResetPasswordFormValues>;
  onSubmit: (data: ResetPasswordFormValues) => void;
}

export function PasswordStep({ form, onSubmit }: PasswordStepProps) {
  const isSubmitting = form.formState.isSubmitting;
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <div className="w-full">
      <div className="space-y-8">
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
                        disabled={isSubmitting}
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
                        disabled={isSubmitting}
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
                state={isSubmitting}
                label="Redefinir senha"
                loadingLabel="Salvando..."
              />
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
