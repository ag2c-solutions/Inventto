import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

import { Button } from '@/shared/components/ui/button';
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
    <div className="flex flex-col gap-4">
      <div className="mb-2">
        <h1 className="text-2xl text-green-950 font-bold">
          Seus dados de acesso
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Quem cadastra nasce como dono da operação.
        </p>
      </div>

      <FormField
        control={form.control}
        name="fullName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nome completo</FormLabel>
            <FormControl>
              <Input placeholder="Ex: Joana Ribeiro" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>E-mail institucional / pessoal</FormLabel>
            <FormControl>
              <Input type="email" placeholder="voce@email.com" {...field} />
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
            <FormLabel htmlFor="signup-password">Senha</FormLabel>
            <FormControl>
              <div className="relative">
                <Input
                  id="signup-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  {...field}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </Button>
              </div>
            </FormControl>
            <p className="text-xs text-muted-foreground">
              Mínimo de 8 caracteres, com letra maiúscula, minúscula, número e
              caractere especial.
            </p>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="passwordConfirmation"
        render={({ field }) => (
          <FormItem>
            <FormLabel htmlFor="signup-password-confirmation">
              Confirmar senha
            </FormLabel>
            <FormControl>
              <div className="relative">
                <Input
                  id="signup-password-confirmation"
                  type={showPasswordConfirmation ? 'text' : 'password'}
                  placeholder="Digite a senha novamente"
                  {...field}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPasswordConfirmation((prev) => !prev)}
                  aria-label={
                    showPasswordConfirmation
                      ? 'Ocultar confirmação de senha'
                      : 'Mostrar confirmação de senha'
                  }
                >
                  {showPasswordConfirmation ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </Button>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="acceptedTerms"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start gap-3 space-y-0">
            <FormControl>
              <Checkbox
                id="accepted-terms"
                checked={field.value === true}
                onCheckedChange={(checked) => field.onChange(checked === true)}
              />
            </FormControl>
            <div className="space-y-1">
              <FormLabel
                htmlFor="accepted-terms"
                className="font-normal cursor-pointer"
              >
                Li e aceito os{' '}
                <a
                  href="/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-foreground hover:text-primary"
                  onClick={(e) => e.stopPropagation()}
                >
                  Termos de Uso
                </a>{' '}
                e a{' '}
                <a
                  href="/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-foreground hover:text-primary"
                  onClick={(e) => e.stopPropagation()}
                >
                  Política de Privacidade
                </a>
                .
              </FormLabel>
              <FormMessage />
            </div>
          </FormItem>
        )}
      />
    </div>
  );
}
