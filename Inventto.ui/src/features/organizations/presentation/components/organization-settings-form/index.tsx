import type { LucideIcon } from 'lucide-react';
import {
  CalendarClock,
  Loader2,
  Save,
  Settings2,
  Store,
  TriangleAlert
} from 'lucide-react';

import { Button } from '@/shared/components/ui/button';
import { Form } from '@/shared/components/ui/form';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/shared/components/ui/tabs';
import { cn } from '@/shared/utils';

import { DangerZoneTabContent } from './tabs/danger';
import { OperationalTabContent } from './tabs/operational';
import { ScheduleTabContent } from './tabs/schedule';
import { StoreTabContent } from './tabs/store';
import { useOrganizationSettingsForm } from './hook';

type TabItem = {
  value: string;
  label: string;
  icon: LucideIcon;
  danger?: boolean;
};

const TAB_ITEMS: TabItem[] = [
  { value: 'general', label: 'Loja', icon: Store },
  { value: 'operational', label: 'Operacional', icon: Settings2 },
  { value: 'schedule', label: 'Horários', icon: CalendarClock },
  { value: 'danger', label: 'Danger Zone', icon: TriangleAlert, danger: true }
];

const TAB_TRIGGER_CLASS =
  'flex-none gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-muted-foreground data-[state=active]:border-border data-[state=active]:text-foreground';

export function OrganizationSettingsForm() {
  const {
    form,
    onSubmit,
    onDiscard,
    isLoading,
    showActionBar,
    organizationName,
    activeTab,
    setActiveTab
  } = useOrganizationSettingsForm();

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="mx-auto w-full space-y-6 px-6 pb-8">
        <header className="flex flex-col gap-1">
          <h1 className="text-[27px] leading-tight font-bold text-foreground">
            Configurações
          </h1>
          <p className="text-sm text-muted-foreground">
            {organizationName ? `${organizationName} · ` : ''}organização ativa
          </p>
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <TabsList className="h-auto flex-wrap gap-1 rounded-xl border bg-muted/40 p-1">
              {TAB_ITEMS.map(({ value, label, icon: Icon, danger }) => (
                <TabsTrigger
                  key={value}
                  value={value}
                  className={cn(
                    TAB_TRIGGER_CLASS,
                    danger &&
                      'text-destructive data-[state=active]:border-destructive/40 data-[state=active]:text-destructive'
                  )}
                >
                  <Icon className="size-4" />
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>

            {showActionBar && (
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onDiscard}
                  disabled={isLoading}
                >
                  Descartar
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Salvando…
                    </>
                  ) : (
                    <>
                      <Save className="size-4" />
                      Salvar alterações
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>

          <TabsContent
            value="general"
            className="space-y-6 w-full bg-background/20 py-2 rounded-2xl"
          >
            <StoreTabContent form={form} />
          </TabsContent>

          <TabsContent
            value="operational"
            className="space-y-6 w-full bg-background/20 py-2 rounded-2xl"
          >
            <OperationalTabContent form={form} />
          </TabsContent>

          <TabsContent
            value="schedule"
            className="space-y-6 w-full bg-background/20 py-2  rounded-2xl"
          >
            <ScheduleTabContent form={form} />
          </TabsContent>

          <TabsContent value="danger" className="w-full">
            <DangerZoneTabContent />
          </TabsContent>
        </Tabs>
      </form>
    </Form>
  );
}
