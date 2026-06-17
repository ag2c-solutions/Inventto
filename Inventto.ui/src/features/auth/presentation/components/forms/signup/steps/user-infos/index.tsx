import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

import { Checkbox } from '@/shared/components/ui/checkbox';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/shared/components/ui/form';
import { Input } from '@/shared/components/ui/input';

import { useSignUpForm } from '../../hook';

export function UserStep() {
  const { form } = useSignUpForm();
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] =
    useState(false);

  return (
    <div className="flex w-full flex-col space-y-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[15px] font-medium text-muted-foreground">
          Passo 2 de 3
        </span>
      </div>

      <div className="flex flex-col space-y-2 text-left">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Seus dados de acesso
        </h1>
        <p className="text-[15px] text-muted-foreground pb-2">
          Quem cadastra nasce como dono da operação.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel className="text-base font-semibold">
                Nome completo
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Ex: Joana Ribeiro"
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
          name="email"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel className="text-base font-semibold">
                E-mail institucional / pessoal
              </FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="voce@email.com"
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
          name="password"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel
                htmlFor="signup-password"
                className="text-base font-semibold"
              >
                Senha
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    id="signup-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="h-12 text-base px-4 pr-12 rounded-xl border-slate-300 tracking-widest placeholder:tracking-widest"
                    {...field}
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={
                      showPassword ? 'Ocultar senha' : 'Mostrar senha'
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </FormControl>
              <p className="text-[13px] text-muted-foreground leading-snug">
                Mínimo de 8 caracteres, com letra maiúscula, minúscula, número e
                caractere especial.
              </p>
              <FormMessage className="text-[#A24444]" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="passwordConfirmation"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel
                htmlFor="signup-password-confirmation"
                className="text-base font-semibold"
              >
                Confirmar senha
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    id="signup-password-confirmation"
                    type={showPasswordConfirmation ? 'text' : 'password'}
                    placeholder="Digite a senha novamente"
                    className="h-12 text-base px-4 pr-12 rounded-xl border-slate-300 tracking-widest placeholder:tracking-normal"
                    {...field}
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPasswordConfirmation((prev) => !prev)}
                    aria-label={
                      showPasswordConfirmation
                        ? 'Ocultar confirmação de senha'
                        : 'Mostrar confirmação de senha'
                    }
                  >
                    {showPasswordConfirmation ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </FormControl>
              <FormMessage className="text-[#A24444]" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="acceptedTerms"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start gap-3 space-y-0 mt-2">
              <FormControl>
                <Checkbox
                  id="accepted-terms"
                  checked={field.value === true}
                  onCheckedChange={(checked) =>
                    field.onChange(checked === true)
                  }
                  className="mt-1 h-5 w-5 border-slate-300 rounded-[4px] data-[state=checked]:bg-foreground data-[state=checked]:border-foreground"
                />
              </FormControl>
              <div className="space-y-1">
                <FormLabel
                  htmlFor="accepted-terms"
                  className="font-normal text-[15px] cursor-pointer text-muted-foreground leading-relaxed"
                >
                  Li e aceito os {/* TODO: criar rota /terms */}
                  <a
                    href="/terms"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-4 text-foreground font-medium hover:text-primary transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Termos de Uso
                  </a>{' '}
                  e a {/* TODO: criar rota /privacy */}
                  <a
                    href="/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-4 text-foreground font-medium hover:text-primary transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Política de Privacidade
                  </a>
                  .
                </FormLabel>
                <FormMessage className="text-[#A24444]" />
              </div>
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
