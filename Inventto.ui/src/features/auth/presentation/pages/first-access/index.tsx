import { useState } from 'react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
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

import { OtpStep } from '../../components/otp-step';
import { useFirstAccess } from '../../hooks/use-first-access';
import { maskEmail } from '../../utils/mask-email';

export function FirstAccessPage() {
  const {
    step,
    form,
    email,
    isReady,
    isPendingPassword,
    isPendingOtp,
    otpError,
    onSubmitPassword,
    onSubmitOtp,
    onResendOtp,
    onBackToPassword
  } = useFirstAccess();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const stepNumber = step === 'password' ? 1 : 2;

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <p className="text-xs text-muted-foreground">
            Passo {stepNumber} de 2
          </p>

          {step === 'password' && (
            <>
              <CardTitle className="text-2xl font-bold">
                Defina sua senha
              </CardTitle>
              <CardDescription>
                Sua organização te convidou para o Inventto. Crie sua senha para
                ativar o acesso.
              </CardDescription>
            </>
          )}
        </CardHeader>

        <CardContent>
          {step === 'password' ? (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmitPassword)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="first-access-password">
                        Nova senha
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            id="first-access-password"
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
                            aria-label={
                              showPassword ? 'Ocultar senha' : 'Mostrar senha'
                            }
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
                        Mínimo de 8 caracteres, com letra maiúscula, minúscula,
                        número e caractere especial.
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="first-access-confirm-password">
                        Confirmar senha
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            id="first-access-confirm-password"
                            type={showConfirmPassword ? 'text' : 'password'}
                            placeholder="Digite a senha novamente"
                            {...field}
                            className="pr-10"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground"
                            onClick={() =>
                              setShowConfirmPassword((prev) => !prev)
                            }
                            aria-label={
                              showConfirmPassword
                                ? 'Ocultar confirmação'
                                : 'Mostrar confirmação'
                            }
                          >
                            {showConfirmPassword ? (
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

                <Button
                  type="submit"
                  className="w-full"
                  disabled={!isReady || isPendingPassword}
                >
                  {isPendingPassword && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {isPendingPassword ? 'Salvando…' : 'Continuar'}
                </Button>
              </form>
            </Form>
          ) : (
            <OtpStep
              title="Confirme seu e-mail"
              sub={`Enviamos um código de 6 dígitos para ${maskEmail(email)}. Digite-o abaixo para ativar seu acesso.`}
              ctaLabel="Ativar meu acesso"
              isSending={isPendingOtp}
              errorMessage={otpError}
              showBack
              backLabel="Voltar para a senha"
              onSubmit={onSubmitOtp}
              onResend={onResendOtp}
              onBack={onBackToPassword}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
