import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';

import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent
} from '@/shared/components/ui/chart';
import { formatCurrency } from '@/shared/utils/formatters/format-currency';

import type { SalesPeriod, SalesSeriesPoint } from '../../../domain/entities';

const chartConfig = {
  pos: { label: 'Balcão · PDV', color: 'var(--chart-1)' },
  online: { label: 'Pedidos · vitrine', color: 'var(--chart-2)' }
} satisfies ChartConfig;

function formatPointLabel(date: string, period: SalesPeriod) {
  const parsed = new Date(date);

  if (period === 'today') {
    return parsed.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  return parsed.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

interface SalesChartProps {
  series: SalesSeriesPoint[];
  period: SalesPeriod;
}

export function SalesChart({ series, period }: SalesChartProps) {
  return (
    <ChartContainer
      config={chartConfig}
      className="aspect-auto h-[220px] w-full"
    >
      <AreaChart data={series}>
        <defs>
          <linearGradient id="fillPos" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-pos)" stopOpacity={0.8} />
            <stop offset="95%" stopColor="var(--color-pos)" stopOpacity={0.1} />
          </linearGradient>
          <linearGradient id="fillOnline" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="5%"
              stopColor="var(--color-online)"
              stopOpacity={0.8}
            />
            <stop
              offset="95%"
              stopColor="var(--color-online)"
              stopOpacity={0.1}
            />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          minTickGap={32}
          tickFormatter={(value: string) => formatPointLabel(value, period)}
        />
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              labelFormatter={(value) => formatPointLabel(value, period)}
              formatter={(value, name) => [
                formatCurrency(value as number) ?? 'R$ 0,00',
                ` ${name === 'pos' ? 'Balcão' : 'Pedidos'}`
              ]}
              indicator="dot"
            />
          }
        />
        <Area
          dataKey="online"
          type="natural"
          fill="url(#fillOnline)"
          stroke="var(--color-online)"
          stackId="a"
        />
        <Area
          dataKey="pos"
          type="natural"
          fill="url(#fillPos)"
          stroke="var(--color-pos)"
          stackId="a"
        />
        <ChartLegend content={<ChartLegendContent />} />
      </AreaChart>
    </ChartContainer>
  );
}
