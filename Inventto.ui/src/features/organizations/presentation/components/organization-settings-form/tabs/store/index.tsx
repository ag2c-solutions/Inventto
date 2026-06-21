import type { UseFormReturn } from 'react-hook-form';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/shared/components/ui/card';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/shared/components/ui/form';
import { Input } from '@/shared/components/ui/input';
import { Separator } from '@/shared/components/ui/separator';
import { Switch } from '@/shared/components/ui/switch';

import type { OrganizationSettingsFormData } from '../../schema';

export const StoreTabContent = ({
  form
}: {
  form: UseFormReturn<OrganizationSettingsFormData>;
}) => {
  return (
    <>
      <Card className="w-full bg-transparent border-none shadow-none">
        <CardHeader className="px-0.5">
          <CardTitle>Identidade da Loja</CardTitle>
          <CardDescription>
            Como sua empresa aparece para os clientes na Vitrine Digital.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 px-0.5">
          <FormField
            control={form.control}
            name="identity.displayName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome Fantasia</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Boutique da Ana" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="identity.logoUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Logo da Marca (URL)</FormLabel>
                <FormControl>
                  <Input placeholder="https://..." {...field} />
                </FormControl>
                <FormDescription>
                  Cole o link da sua logo hospedada ou deixe em branco.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>
      <Separator />
      <Card className="w-full bg-transparent border-none shadow-none">
        <CardHeader>
          <CardTitle>Regras de Venda</CardTitle>
          <CardDescription>
            Controle como sua loja se comporta fora do horário comercial.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FormField
            control={form.control}
            name="sales.acceptOrdersOutsideHours"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm bg-muted/20">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">
                    Aceitar pedidos com a loja fechada?
                  </FormLabel>
                  <FormDescription>
                    Clientes podem reservar peças de madrugada. A reserva expira
                    ao abrir da loja.
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </CardContent>
      </Card>
    </>
  );
};
