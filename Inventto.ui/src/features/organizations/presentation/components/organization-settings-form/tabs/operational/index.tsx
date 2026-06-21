import { AlertCircle } from 'lucide-react';
import type { UseFormReturn } from 'react-hook-form';

import {
  Alert,
  AlertDescription,
  AlertTitle
} from '@/shared/components/ui/alert';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/shared/components/ui/select';

import { TIMEZONES } from '../../../../constants/times-zones';
import type { OrganizationSettingsFormData } from '../../schema';

export const OperationalTabContent = ({
  form
}: {
  form: UseFormReturn<OrganizationSettingsFormData>;
}) => {
  return (
    <Card className="w-full bg-transparent border-none shadow-none">
      <CardHeader>
        <CardTitle>Operacional & Contato</CardTitle>
        <CardDescription>
          Configurações críticas para o funcionamento do sistema e notificações.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert
          variant="default"
          className="bg-blue-50 border-blue-200 text-blue-800"
        >
          <AlertCircle className="h-4 w-4 text-blue-800" />
          <AlertTitle>Atenção ao Fuso Horário</AlertTitle>
          <AlertDescription>
            O sistema usa este campo para calcular automaticamente quando as
            reservas de estoque expiram.
          </AlertDescription>
        </Alert>

        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="operational.timezone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fuso Horário (Timezone)</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
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
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="operational.whatsappMain"
            render={({ field }) => (
              <FormItem>
                <FormLabel>WhatsApp Principal</FormLabel>
                <FormControl>
                  <Input placeholder="(11) 99999-9999" {...field} />
                </FormControl>
                <FormDescription>
                  Número que receberá os pedidos ("Shadow Orders").
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
};
