import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar as CalendarIcon, ChevronDown } from 'lucide-react';
import { type DateRange } from 'react-day-picker';

import { Button } from '@/shared/components/ui/button';
import { Calendar } from '@/shared/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/shared/components/ui/popover';
import { cn } from '@/shared/utils';

import { useDataTable } from '../../hook/use-data-table';
import { DATE_RANGE_PRESETS, resolveDateRangePreset } from '../../utils';

interface DataTableDateRangeFilterProps {
  column: string;
  title?: string;
}

type SelectedPreset = (typeof DATE_RANGE_PRESETS)[number]['id'] | 'custom';

export function DataTableDateRangeFilter({
  column,
  title = 'Selecione uma data'
}: DataTableDateRangeFilterProps) {
  const { table } = useDataTable();
  const tableColumn = table.getColumn(column);
  const appliedDate = tableColumn?.getFilterValue() as DateRange | undefined;

  const [open, setOpen] = useState(false);
  const [pendingDate, setPendingDate] = useState<DateRange | undefined>(
    appliedDate
  );
  const [selectedPreset, setSelectedPreset] = useState<
    SelectedPreset | undefined
  >(undefined);

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);

    if (nextOpen) {
      setPendingDate(appliedDate);
      setSelectedPreset(undefined);
    }
  };

  const handlePresetClick = (preset: (typeof DATE_RANGE_PRESETS)[number]) => {
    setSelectedPreset(preset.id);
    setPendingDate(resolveDateRangePreset(preset.daysAgo));
  };

  const handleCalendarSelect = (range: DateRange | undefined) => {
    setSelectedPreset('custom');
    setPendingDate(range);
  };

  const handleApply = () => {
    tableColumn?.setFilterValue(pendingDate);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-full md:w-[260px] justify-start rounded-full text-left font-normal',
            !appliedDate?.from && 'text-muted-foreground'
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
          {appliedDate?.from ? (
            appliedDate.to ? (
              <>
                {format(appliedDate.from, 'dd/MM/y', { locale: ptBR })} –{' '}
                {format(appliedDate.to, 'dd/MM/y', { locale: ptBR })}
              </>
            ) : (
              format(appliedDate.from, 'dd/MM/y', { locale: ptBR })
            )
          ) : (
            <span>{title}</span>
          )}
          <ChevronDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex">
          <div className="flex w-[190px] flex-col gap-1 border-r p-3">
            {DATE_RANGE_PRESETS.map((preset) => (
              <Button
                key={preset.id}
                type="button"
                variant={selectedPreset === preset.id ? 'secondary' : 'ghost'}
                className="justify-start font-normal"
                onClick={() => handlePresetClick(preset)}
              >
                {preset.label}
              </Button>
            ))}
            <Button
              type="button"
              variant={selectedPreset === 'custom' ? 'secondary' : 'ghost'}
              className="justify-start font-normal"
              onClick={() => setSelectedPreset('custom')}
            >
              Personalizado
            </Button>
            <Button
              type="button"
              className="mt-2 bg-green-950 hover:bg-green-900"
              onClick={handleApply}
            >
              Aplicar
            </Button>
          </div>
          <Calendar
            mode="range"
            defaultMonth={pendingDate?.from}
            selected={pendingDate}
            onSelect={handleCalendarSelect}
            numberOfMonths={2}
            locale={ptBR}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
