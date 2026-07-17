import type { Row } from '@tanstack/react-table';
import { endOfDay, startOfDay, subDays } from 'date-fns';

export interface DateRangePreset {
  id: 'today' | '7d' | '30d' | '60d' | '90d';
  label: string;
  daysAgo: number;
}

export const DATE_RANGE_PRESETS: DateRangePreset[] = [
  { id: 'today', label: 'Hoje', daysAgo: 0 },
  { id: '7d', label: 'Últimos 7 dias', daysAgo: 6 },
  { id: '30d', label: 'Últimos 30 dias', daysAgo: 29 },
  { id: '60d', label: 'Últimos 60 dias', daysAgo: 59 },
  { id: '90d', label: 'Últimos 90 dias', daysAgo: 89 }
];

export function resolveDateRangePreset(daysAgo: number): {
  from: Date;
  to: Date;
} {
  const now = new Date();

  return { from: startOfDay(subDays(now, daysAgo)), to: endOfDay(now) };
}

export const dateRangeFilter = (
  row: Row<unknown>,
  columnId: string,
  value: { from?: Date; to?: Date } | null | undefined
) => {
  const dateValue = row.getValue(columnId);
  const { from, to } = value || {};

  if (!from && !to) return true;
  if (!dateValue) return false;

  const rowDate = new Date(dateValue as string | number);

  if (from && to) {
    return rowDate >= from && rowDate <= to;
  }

  if (from) {
    return rowDate >= from;
  }

  if (to) {
    return rowDate <= to;
  }
};
