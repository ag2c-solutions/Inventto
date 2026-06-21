import type { UseFormReturn } from 'react-hook-form';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/shared/components/ui/card';
import { FormControl, FormField, FormItem } from '@/shared/components/ui/form';
import { Input } from '@/shared/components/ui/input';
import { Separator } from '@/shared/components/ui/separator';
import { Switch } from '@/shared/components/ui/switch';
import { cn } from '@/shared/utils';

import { WEEK_DAYS } from '../../../../constants/week-days';
import type { OrganizationSettingsFormData } from '../../schema';

export const ScheduleTabContent = ({
  form
}: {
  form: UseFormReturn<OrganizationSettingsFormData>;
}) => {
  return (
    <Card className="w-full bg-transparent border-none shadow-none">
      <CardHeader>
        <CardTitle>Horário de Funcionamento</CardTitle>
        <CardDescription>
          Defina a grade de abertura para cálculo automático de prazos.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-12 gap-4 text-sm font-medium text-muted-foreground mb-2 px-2">
            <div className="col-span-4 md:col-span-3">Dia</div>
            <div className="col-span-3 md:col-span-3 text-center">Status</div>
            <div className="col-span-5 md:col-span-4 grid grid-cols-2 gap-4">
              <span>Abertura</span>
              <span>Fechamento</span>
            </div>
          </div>

          <Separator className="mb-4" />

          {WEEK_DAYS.map((day) => {
            const isOpen = form.watch(`schedule.${day.key}.isOpen`);
            // Detecta erro específico neste dia para destacar visualmente
            const dayError = form.formState.errors.schedule?.[day.key];

            return (
              <div
                key={day.key}
                className={cn(
                  'grid grid-cols-12 gap-4 items-center px-2 py-2 rounded-md transition-colors',
                  dayError ? 'bg-red-50' : 'hover:bg-muted/50'
                )}
              >
                <div className="col-span-4 md:col-span-3 font-medium flex items-center gap-2">
                  {day.label}
                  {dayError && (
                    <span className="h-2 w-2 rounded-full bg-red-500" />
                  )}
                </div>

                {/* Toggle Status */}
                <div className="col-span-3 md:col-span-3 flex justify-center">
                  <FormField
                    control={form.control}
                    name={`schedule.${day.key}.isOpen`}
                    render={({ field }) => (
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    )}
                  />
                </div>

                {/* Inputs de Hora */}
                <div className="col-span-5 md:col-span-4 grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name={`schedule.${day.key}.open`}
                    render={({ field }) => (
                      <FormItem className="space-y-0 max-w-28">
                        <FormControl>
                          <Input
                            type="time"
                            className={cn(
                              'h-8',
                              dayError?.open && 'border-red-500'
                            )}
                            disabled={!isOpen}
                            {...field}
                            value={field.value || ''}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`schedule.${day.key}.close`}
                    render={({ field }) => (
                      <FormItem className="space-y-0 max-w-28">
                        <FormControl>
                          <Input
                            type="time"
                            className={cn(
                              'h-8',
                              dayError?.close && 'border-red-500'
                            )}
                            disabled={!isOpen}
                            {...field}
                            value={field.value || ''}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
