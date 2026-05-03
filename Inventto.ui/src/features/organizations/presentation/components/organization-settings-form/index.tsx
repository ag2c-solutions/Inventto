import {
  AlertCircle,
  CalendarClock,
  Loader2,
  Save,
  Settings2,
  Store
} from 'lucide-react';

import {
  Alert,
  AlertDescription,
  AlertTitle
} from '@/shared/components/ui/alert';
// Components UI
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
import { Separator } from '@/shared/components/ui/separator';
import { Switch } from '@/shared/components/ui/switch';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/shared/components/ui/tabs';
import { cn } from '@/shared/utils';

import { useOrganizationSettingsForm } from './hook';

// Constants (Mesmas de antes)
const TIMEZONES = [
  { value: 'America/Sao_Paulo', label: 'Brasília (GMT-3)' },
  { value: 'America/Manaus', label: 'Manaus (GMT-4)' },
  { value: 'America/Noronha', label: 'Fernando de Noronha (GMT-2)' },
  { value: 'America/Rio_Branco', label: 'Rio Branco (GMT-5)' }
];

const WEEK_DAYS = [
  { key: 'mon', label: 'Segunda-feira' },
  { key: 'tue', label: 'Terça-feira' },
  { key: 'wed', label: 'Quarta-feira' },
  { key: 'thu', label: 'Quinta-feira' },
  { key: 'fri', label: 'Sexta-feira' },
  { key: 'sat', label: 'Sábado' },
  { key: 'sun', label: 'Domingo' }
] as const;

export function OrganizationSettingsForm() {
  const { form, onSubmit, isLoading, isDirty, activeTab, setActiveTab } =
    useOrganizationSettingsForm();

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-8 w-full pb-20">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="w-full flex items-center justify-between">
            <TabsList className="inline-flex w-fit h-fit items-center border bg-transparent justify-center rounded-2xl px-4 gap-4 py-2 text-muted-foreground">
              <TabsTrigger
                value="general"
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-primary/50 data-[state=active]:text-foreground data-[state=active]:shadow-sm gap-2"
              >
                <Store className="h-4 w-4" />
                <span className="hidden sm:inline">Loja & Vendas</span>
              </TabsTrigger>
              <TabsTrigger
                value="operational"
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-primary/50 data-[state=active]:text-foreground data-[state=active]:shadow-sm gap-2"
              >
                <Settings2 className="h-4 w-4" />
                <span className="hidden sm:inline">Operacional</span>
              </TabsTrigger>
              <TabsTrigger
                value="schedule"
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-primary/50 data-[state=active]:text-foreground data-[state=active]:shadow-sm gap-2"
              >
                <CalendarClock className="h-4 w-4" />
                <span className="hidden sm:inline">Horários</span>
              </TabsTrigger>
            </TabsList>
            <div className=" items-center  gap-4 px-2 py-2 flex justify-end w-fit">
              <Button
                type="button"
                variant="ghost"
                onClick={() => form.reset()}
                disabled={isLoading || !isDirty}
              >
                Descartar
              </Button>
              <Button type="submit" disabled={isLoading || !isDirty}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Save className="mr-2 h-4 w-4" />
                Salvar Alterações
              </Button>
            </div>
          </div>

          <TabsContent
            value="general"
            className="space-y-6 w-full bg-background/20 p-2 rounded-2xl"
          >
            <Card className="w-full bg-transparent border-none shadow-none">
              <CardHeader>
                <CardTitle>Identidade da Loja</CardTitle>
                <CardDescription>
                  Como sua empresa aparece para os clientes na Vitrine Digital.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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
                          Clientes podem reservar peças de madrugada. A reserva
                          expira ao abrir da loja.
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
          </TabsContent>

          <TabsContent
            value="operational"
            className="space-y-6 w-full bg-background/20 p-2 rounded-2xl"
          >
            <Card className="w-full bg-transparent border-none shadow-none">
              <CardHeader>
                <CardTitle>Operacional & Contato</CardTitle>
                <CardDescription>
                  Configurações críticas para o funcionamento do sistema e
                  notificações.
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
                    O sistema usa este campo para calcular automaticamente
                    quando as reservas de estoque expiram.
                  </AlertDescription>
                </Alert>

                <div className="grid gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="operational.timezone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fuso Horário (Timezone)</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
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
          </TabsContent>

          <TabsContent
            value="schedule"
            className="space-y-6 w-full bg-background/20 p-2  rounded-2xl"
          >
            <Card className="w-full bg-transparent border-none shadow-none">
              <CardHeader>
                <CardTitle>Horário de Funcionamento</CardTitle>
                <CardDescription>
                  Defina a grade de abertura para cálculo automático de prazos.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Exibe erro global de schedule se houver */}
                {form.formState.errors.schedule && (
                  <Alert variant="destructive" className="mb-6">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Erro na Grade de Horários</AlertTitle>
                    <AlertDescription>
                      Verifique se todos os dias marcados como "Aberto" possuem
                      horários de início e fim válidos.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-4">
                  <div className="grid grid-cols-12 gap-4 text-sm font-medium text-muted-foreground mb-2 px-2">
                    <div className="col-span-4 md:col-span-3">Dia</div>
                    <div className="col-span-3 md:col-span-3 text-center">
                      Status
                    </div>
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
                        {/* Label Dia */}
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
          </TabsContent>
        </Tabs>
      </form>
    </Form>
  );
}
