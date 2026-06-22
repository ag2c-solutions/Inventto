import type { UseFormReturn } from 'react-hook-form';

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/shared/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/shared/components/ui/select';
import { Separator } from '@/shared/components/ui/separator';
import { Switch } from '@/shared/components/ui/switch';

import { TIMEZONES } from '../../../../constants/times-zones';
import type { OrganizationSettingsFormData } from '../../schema';

export const OperationalTabContent = ({
  form
}: {
  form: UseFormReturn<OrganizationSettingsFormData>;
}) => {
  return (
    <div className="space-y-6 text-muted-foreground">
      <FormField
        control={form.control}
        name="operational.timezone"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-foreground">Fuso horário</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger className="w-full max-w-96">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {TIMEZONES.map((tz) => (
                  <SelectItem key={tz.value} value={tz.value}>
                    {tz.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormDescription>
              Usado para calcular o status de abertura da vitrine.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <Separator />

      <FormField
        control={form.control}
        name="sales.acceptOrdersOutsideHours"
        render={({ field }) => (
          <FormItem className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <FormLabel className="text-foreground">
                Aceitar pedidos com a loja fechada
              </FormLabel>
              <FormDescription>
                Quando ativado, a vitrine aceita pedidos mesmo fora do horário
                de funcionamento, com aviso ao cliente.
              </FormDescription>
            </div>
            <FormControl>
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  );
};
