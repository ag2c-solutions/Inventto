import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarIcon, TrendingDown, TrendingUp } from 'lucide-react';

import { Calendar } from '@/shared/components/ui/calendar';
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
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/shared/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/shared/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Textarea } from '@/shared/components/ui/textarea';
import { cn } from '@/shared/utils';

import type { MovementType } from '@/features/movements';

import { useMovementForm } from '../../hooks';

export function MovementFormHeader() {
  const { form, reasonOptions, actions } = useMovementForm();

  const reason = form.watch('reason');

  return (
    <div className="space-y-5">
      <FormField
        control={form.control}
        name="type"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tipo de movimentação</FormLabel>
            <FormControl>
              <Tabs
                value={field.value}
                onValueChange={(value) =>
                  actions.onChangeType(value as MovementType)
                }
              >
                <TabsList className="w-full grid grid-cols-2 h-11 p-1">
                  <TabsTrigger
                    value="entry"
                    className="gap-2 data-[state=active]:bg-green-50 data-[state=active]:text-green-700 dark:data-[state=active]:bg-green-900/30 dark:data-[state=active]:text-green-400"
                  >
                    <TrendingUp className="h-4 w-4" />
                    Entrada
                  </TabsTrigger>
                  <TabsTrigger
                    value="withdrawal"
                    className="gap-2 data-[state=active]:bg-red-50 data-[state=active]:text-red-700 dark:data-[state=active]:bg-red-900/30 dark:data-[state=active]:text-red-400"
                  >
                    <TrendingDown className="h-4 w-4" />
                    Saída
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="reason"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Motivo</FormLabel>
            <Select value={field.value} onValueChange={field.onChange}>
              <FormControl>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione um motivo" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {reasonOptions.map((option) => (
                  <SelectItem key={`reason-${option}`} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormDescription>{reasonOptions.join(' · ')}</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {reason === 'Outro' && (
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição do motivo</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Descreva o motivo da movimentação."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Obrigatório quando o motivo é &quot;Outro&quot;.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      <FormField
        control={form.control}
        name="documentNumber"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Documento de referência (opcional)</FormLabel>
            <FormControl>
              <Input
                placeholder="Nº de NF, pedido ou outro identificador."
                {...field}
              />
            </FormControl>
          </FormItem>
        )}
      />

      <div className="flex gap-3">
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormLabel>Data e hora</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <button
                      type="button"
                      className={cn(
                        'flex h-10 w-full items-center gap-2 rounded-md border bg-background px-3 text-sm',
                        !field.value && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="h-4 w-4 shrink-0 opacity-60" />
                      {field.value
                        ? format(field.value, 'dd/MM/yyyy', { locale: ptBR })
                        : 'Selecione uma data'}
                    </button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={(date) => date && field.onChange(date)}
                    disabled={(date) => date > new Date()}
                  />
                </PopoverContent>
              </Popover>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="time"
          render={({ field }) => (
            <FormItem className="w-28">
              <FormLabel>&nbsp;</FormLabel>
              <FormControl>
                <Input type="time" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
      </div>
      <FormDescription className="-mt-3">
        Pré-preenchida com o momento atual. Edite para registros retroativos.
      </FormDescription>
    </div>
  );
}
