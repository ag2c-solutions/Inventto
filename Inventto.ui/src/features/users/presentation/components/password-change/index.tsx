import { useState } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';

import { SubmitingButton } from '@/shared/components/common/submiting-button';
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogTrigger
} from '@/shared/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/shared/components/ui/form';
import { Input } from '@/shared/components/ui/input';

import { useChangePassword } from './hook';

export function PasswordChange() {
  const { form, isSubmitting, handleSubmit } = useChangePassword();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant={'ghost'}
          size="sm"
          className="w-full justify-start font-normal text-muted-foreground"
        >
          <Lock className="h-4 w-4" />
          <span>Alterar senha</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <Form {...form}>
          <form
            id="change-password"
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nova Senha</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        {...field}
                        disabled={isSubmitting}
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                        tabIndex={-1}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span className="sr-only">
                          {showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                        </span>
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirmar Nova Senha</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        {...field}
                        disabled={isSubmitting}
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        tabIndex={-1}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span className="sr-only">
                          {showConfirmPassword
                            ? 'Ocultar senha'
                            : 'Mostrar senha'}
                        </span>
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline" disabled={isSubmitting}>
              Cancelar
            </Button>
          </DialogClose>
          <SubmitingButton
            form="change-password"
            type="submit"
            state={isSubmitting}
            label="Atualizar Senha"
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
