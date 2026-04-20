import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router";
import { Loader2, LockKeyhole } from "lucide-react";

import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/app/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";

import { useAuth } from "../../hooks/use-auth";
import { useCompleteFirstAccessMutation } from "../../hooks/use-query";

const firstAccessSchema = z.object({
  password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres."),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

type FirstAccessData = z.infer<typeof firstAccessSchema>;

export function FirstAccessPage() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const { mutateAsync } = useCompleteFirstAccessMutation()

  const form = useForm<FirstAccessData>({
    resolver: zodResolver(firstAccessSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const onSubmit = async (data: FirstAccessData) => {
    if(!session) {
      return;
    }

    await mutateAsync({
      newPassword: data.password,
      userId: session.user.id,
    }).then(() => {
      console.log('Senha definida com sucesso!');
      navigate('/products', { replace: true });
    }).catch((error) => {
      console.error(error);
    }).finally(() => {
      setIsLoading(false);
    });
    
  };

  return (
    <div className="flex min-h-screen items-center justify-centerpx-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-primary/10 p-3">
              <LockKeyhole className="h-6 w-6 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Definir Senha de Acesso</CardTitle>
          <CardDescription>
            Como este é seu primeiro acesso, por segurança, você precisa definir uma nova senha pessoal.
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
              <Button onClick={form.handleSubmit(onSubmit)} className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Confirmar e Acessar
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}