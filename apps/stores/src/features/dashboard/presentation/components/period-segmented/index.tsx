import { Tabs, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';

import type { SalesPeriod } from '../../../domain/entities';

const PERIOD_OPTIONS: { value: SalesPeriod; label: string }[] = [
  { value: 'today', label: 'Hoje' },
  { value: '7d', label: '7 dias' },
  { value: '30d', label: '30 dias' },
  { value: '90d', label: '90 dias' }
];

interface PeriodSegmentedProps {
  value: SalesPeriod;
  onChange: (period: SalesPeriod) => void;
}

export function PeriodSegmented({ value, onChange }: PeriodSegmentedProps) {
  return (
    <Tabs
      value={value}
      onValueChange={(period) => onChange(period as SalesPeriod)}
    >
      <TabsList aria-label="Período do resumo de vendas">
        {PERIOD_OPTIONS.map((option) => (
          <TabsTrigger key={option.value} value={option.value}>
            {option.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
