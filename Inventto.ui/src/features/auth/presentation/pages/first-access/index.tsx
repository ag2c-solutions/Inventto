import { useNavigate } from 'react-router';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, LockKeyhole } from 'lucide-react';
import { useForm } from 'react-hook-form';

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

import {
  type FirstAccessFormValues,
  firstAccessSchema
} from '../../../domain/validators';
import { useAuth } from '../../hooks/use-auth';
import { useCompleteFirstAccessMutation } from '../../hooks/use-mutations';

export function FirstAccessPage() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const { mutateAsync, isPending } = useCompleteFirstAccessMutation();

  const form = useForm<FirstAccessFormValues>({
    resolver: zodResolver(firstAccessSchema),
    defaultValues: { password: '', confirmPassword: '' }
  });

  const onSubmit = async (data: FirstAccessFormValues) => {
    if (!session) {
      return;
    }

    await mutateAsync({
      newPassword: data.password,
      userId: session.user.id
    })
      .then(() => {
        navigate('/products', { replace: true });
      })
      .catch(() => {
        return;
      });
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-primary/10 p-3">
              <LockKeyhole className="h-6 w-6 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">
            Definir Senha de Acesso
          </CardTitle>
          <CardDescription>
            Como este é seu primeiro acesso, por segurança, você precisa definir
            uma nova senha pessoal.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nova Senha</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
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
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Confirmar e Acessar
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
