import { useEffect, useState } from 'react';
import type { LucideIcon } from 'lucide-react';

import { Tabs, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';

import { useDataTable } from '../../hook/use-data-table';

export interface IDataTableTabFilter<T> {
  column: string;
  options: {
    Icon?: LucideIcon;
    value: T;
    label: string;
  }[];
  initialValue: T;
  onValueChange?: (value: T) => void;
}

export function DataTableTabFilter<T>({
  column,
  options,
  initialValue,
  onValueChange
}: IDataTableTabFilter<T>) {
  const { table } = useDataTable();
  const [currentValue, setCurrentValue] = useState<T>(initialValue);
  const tableColumn = table.getColumn(column);

  const handleValueChange = (newValue: T) => {
    if (newValue === 'all') tableColumn?.setFilterValue(undefined);
    else tableColumn?.setFilterValue(newValue);

    setCurrentValue(newValue);
    onValueChange?.(newValue);
  };

  useEffect(() => {
    if (initialValue === 'all') return;

    setCurrentValue(initialValue);
    tableColumn?.setFilterValue(initialValue);
  }, [initialValue, tableColumn]);

  return (
    <Tabs
      value={currentValue as string}
      onValueChange={handleValueChange as (value: string) => void}
      className="w-auto"
    >
      <TabsList className="grid grid-flow-col justify-start h-9 bg-sidebar">
        {options.map(({ value, label, Icon }) => {
          return (
            <TabsTrigger
              key={`filter-tab-${column}-${value}`}
              value={value as string}
              className={`px-3 ${currentValue === value && 'text-primary'}`}
            >
              {Icon && <Icon className="size-4" />}
              {label}
            </TabsTrigger>
          );
        })}
      </TabsList>
    </Tabs>
  );
}
