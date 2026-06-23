import type { UseFormReturn } from 'react-hook-form';

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
    <div className="space-y-4 text-muted-foreground">
      <p className="text-sm text-muted-foreground">
        Os horários controlam o status da vitrine para os clientes.
      </p>

      <div className="pt-2">
        {WEEK_DAYS.map((day, index) => {
          const isOpen = form.watch(`schedule.${day.key}.isOpen`);
          // Destaca o dia quando houver erro de validação (faixa única por dia).
          const dayError = form.formState.errors.schedule?.[day.key];

          return (
            <div key={day.key}>
              {index > 0 && <Separator />}

              <div
                className={cn(
                  'flex items-center gap-3 py-4 rounded-md transition-colors md:gap-4',
                  dayError && 'bg-red-50'
                )}
              >
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

                <span className="w-20 font-medium text-foreground md:w-24">
                  {day.label}
                </span>

                {isOpen ? (
                  <div className="flex flex-1 items-center gap-2 md:flex-none md:gap-3">
                    <FormField
                      control={form.control}
                      name={`schedule.${day.key}.open`}
                      render={({ field }) => (
                        <FormItem className="flex-1 space-y-0 md:flex-none">
                          <FormControl>
                            <Input
                              type="time"
                              className={cn(
                                'w-full md:w-32',
                                dayError?.open && 'border-red-500'
                              )}
                              {...field}
                              value={field.value || ''}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <span className="text-sm text-muted-foreground">até</span>

                    <FormField
                      control={form.control}
                      name={`schedule.${day.key}.close`}
                      render={({ field }) => (
                        <FormItem className="flex-1 space-y-0 md:flex-none">
                          <FormControl>
                            <Input
                              type="time"
                              className={cn(
                                'w-full md:w-32',
                                dayError?.close && 'border-red-500'
                              )}
                              {...field}
                              value={field.value || ''}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                ) : (
                  <span className="text-sm italic text-muted-foreground">
                    Fechado
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
