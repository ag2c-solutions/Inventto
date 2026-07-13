import { cloneElement, isValidElement, type ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { SalesSeriesPoint } from '../../../domain/entities';

// vi.mock factories are hoisted above the rest of the file, so they can't
// close over module-level consts (Vitest throws a TDZ error) — the fake
// payload below is duplicated inline instead of reusing FAKE_POINT.
vi.mock('recharts', () => {
  const point = { date: '2026-07-12T00:00:00', pos: 80, online: 120 };
  const FAKE_TOOLTIP_PAYLOAD = [
    {
      dataKey: 'online',
      name: 'online',
      value: point.online,
      color: 'var(--chart-2)',
      payload: point
    },
    {
      dataKey: 'pos',
      name: 'pos',
      value: point.pos,
      color: 'var(--chart-1)',
      payload: point
    }
  ];
  const FAKE_LEGEND_PAYLOAD = [
    { value: 'online', dataKey: 'online', color: 'var(--chart-2)' },
    { value: 'pos', dataKey: 'pos', color: 'var(--chart-1)' }
  ];

  return {
    ResponsiveContainer: ({ children }: { children: ReactNode }) => (
      <div>{children}</div>
    ),
    AreaChart: ({
      children,
      data
    }: {
      children: ReactNode;
      data: unknown[];
    }) => (
      <div data-testid="area-chart" data-points={data.length}>
        {children}
      </div>
    ),
    Area: ({ dataKey, stackId }: { dataKey: string; stackId: string }) => (
      <div data-testid={`area-${dataKey}`} data-stack={stackId} />
    ),
    CartesianGrid: () => null,
    XAxis: () => null,
    Tooltip: ({ content }: { content?: ReactNode }) => {
      if (!isValidElement(content)) return null;
      return cloneElement(content, {
        active: true,
        payload: FAKE_TOOLTIP_PAYLOAD,
        label: point.date
      } as object);
    },
    Legend: ({ content }: { content?: ReactNode }) => {
      if (!isValidElement(content)) return null;
      return cloneElement(content, { payload: FAKE_LEGEND_PAYLOAD } as object);
    }
  };
});

import { SalesChart } from '.';

const FAKE_POINT: SalesSeriesPoint = {
  date: '2026-07-12T00:00:00',
  pos: 80,
  online: 120
};

describe('SalesChart', () => {
  it('should render the two stacked series (Balcão + Pedidos) sharing a stack id', () => {
    render(<SalesChart series={[FAKE_POINT]} period="30d" />);

    const pos = screen.getByTestId('area-pos');
    const online = screen.getByTestId('area-online');

    expect(pos.dataset.stack).toBe(online.dataset.stack);
  });

  it('should show the legend for both series', () => {
    render(<SalesChart series={[FAKE_POINT]} period="30d" />);

    expect(screen.getByText('Balcão · PDV')).toBeInTheDocument();
    expect(screen.getByText('Pedidos · vitrine')).toBeInTheDocument();
  });

  it('should show the tooltip with the value of each series for the hovered date', () => {
    render(<SalesChart series={[FAKE_POINT]} period="30d" />);

    expect(screen.getByText(/R\$\s*80,00/)).toBeInTheDocument();
    expect(screen.getByText(/R\$\s*120,00/)).toBeInTheDocument();
  });

  it('should not break when the series is empty', () => {
    render(<SalesChart series={[]} period="30d" />);

    expect(screen.getByTestId('area-chart').dataset.points).toBe('0');
  });

  // DASH-06: largura fluida (`w-full`, sem px fixo) é o que garante que o
  // gráfico não force overflow horizontal em ~390px — o ResponsiveContainer
  // real do recharts (mockado acima) é quem faz a medição de fato.
  it('should render with a fluid width (no fixed px width that could overflow on mobile)', () => {
    const { container } = render(
      <SalesChart series={[FAKE_POINT]} period="30d" />
    );

    const chart = container.querySelector('[data-slot="chart"]');

    expect(chart).toHaveClass('w-full');
    expect(chart?.className).not.toMatch(/\bw-\[\d/);
  });
});
