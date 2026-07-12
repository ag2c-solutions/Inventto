import type { LucideIcon } from 'lucide-react';
import { AlignLeft, Brush, Sliders } from 'lucide-react';

import { TabsList, TabsTrigger } from '@/shared/components/ui/tabs';

type ConfigTabItem = {
  value: string;
  label: string;
  icon: LucideIcon;
};

// Aparência/Comportamento ganham conteúdo em VIT-04/05 — a casca de tabs
// (com os 3 gatilhos) já entra completa aqui.
const CONFIG_TAB_ITEMS: ConfigTabItem[] = [
  { value: 'geral', label: 'Geral', icon: AlignLeft },
  { value: 'aparencia', label: 'Aparência', icon: Brush },
  { value: 'comportamento', label: 'Comportamento', icon: Sliders }
];

const TAB_TRIGGER_CLASS =
  'flex-none gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-muted-foreground data-[state=active]:border-border data-[state=active]:text-foreground';

export function ConfigTabs() {
  return (
    <TabsList className="h-auto flex-wrap gap-1 rounded-xl border text-sidebar-accent p-1">
      {CONFIG_TAB_ITEMS.map(({ value, label, icon: Icon }) => (
        <TabsTrigger key={value} value={value} className={TAB_TRIGGER_CLASS}>
          <Icon className="size-4" />
          {label}
        </TabsTrigger>
      ))}
    </TabsList>
  );
}
