import { ArrowDown, ArrowUp } from 'lucide-react';

import { useDataTable } from '@/shared/components/common/data-table/hook/use-data-table';
import { Tabs, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { cn } from '@/shared/utils';

import type { Movement } from '../../../domain/entities';

export function MovementsTypeTabs() {
  const { table } = useDataTable<Movement>();
  const tableColumn = table.getColumn('type');
  const filterValue = (tableColumn?.getFilterValue() as string) ?? 'all';

  const handleChange = (value: string) => {
    tableColumn?.setFilterValue(value === 'all' ? undefined : value);
  };

  return (
    <Tabs value={filterValue} onValueChange={handleChange}>
      <TabsList>
        <TabsTrigger value="all">Todos</TabsTrigger>
        <TabsTrigger
          value="entry"
          className={cn(
            'gap-1.5',
            filterValue === 'entry' &&
              'text-green-700 dark:text-green-400 [&_svg]:text-green-700 dark:[&_svg]:text-green-400'
          )}
        >
          <ArrowUp className="h-4 w-4" />
          Entradas
        </TabsTrigger>
        <TabsTrigger
          value="withdrawal"
          className={cn(
            'gap-1.5',
            filterValue === 'withdrawal' &&
              'text-red-700 dark:text-red-400 [&_svg]:text-red-700 dark:[&_svg]:text-red-400'
          )}
        >
          <ArrowDown className="h-4 w-4" />
          Saídas
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
