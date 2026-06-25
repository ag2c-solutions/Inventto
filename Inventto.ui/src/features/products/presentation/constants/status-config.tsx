import { Ban, CircleX, SquareCheck, TriangleAlert } from 'lucide-react';
import type { ReactNode } from 'react';

import type { ProductStockStatus } from '../../domain/entities';

export type StockStatusConfig = {
  icon: ReactNode;
  iconSmall: ReactNode;
  label: string;
  /** Cor forte do estado (ícone/texto). */
  textClassName: string;
  /** Badge: soft de fundo + texto forte + borda suave. */
  badgeClassName: string;
};

export const STOCK_STATUS_CONFIG = {
  zeroed: {
    icon: <Ban className="h-6 w-6 text-[var(--status-zeroed)]" />,
    iconSmall: <Ban className="h-4 w-4 text-[var(--status-zeroed)]" />,
    label: 'Zerado',
    textClassName: 'text-[var(--status-zeroed)]',
    badgeClassName:
      'bg-[var(--status-zeroed-soft)] text-[var(--status-zeroed)] border-[var(--status-zeroed)]/30'
  },
  critical: {
    icon: <CircleX className="h-6 w-6 text-[var(--status-critical)]" />,
    iconSmall: <CircleX className="h-4 w-4 text-[var(--status-critical)]" />,
    label: 'Crítico',
    textClassName: 'text-[var(--status-critical)]',
    badgeClassName:
      'bg-[var(--status-critical-soft)] text-[var(--status-critical)] border-[var(--status-critical)]/30'
  },
  warning: {
    icon: <TriangleAlert className="h-6 w-6 text-[var(--status-warning)]" />,
    iconSmall: (
      <TriangleAlert className="h-4 w-4 text-[var(--status-warning)]" />
    ),
    label: 'Atenção',
    textClassName: 'text-[var(--status-warning)]',
    badgeClassName:
      'bg-[var(--status-warning-soft)] text-[var(--status-warning)] border-[var(--status-warning)]/30'
  },
  healthy: {
    icon: <SquareCheck className="h-6 w-6 text-[var(--status-healthy)]" />,
    iconSmall: <SquareCheck className="h-4 w-4 text-[var(--status-healthy)]" />,
    label: 'Saudável',
    textClassName: 'text-[var(--status-healthy)]',
    badgeClassName:
      'bg-[var(--status-healthy-soft)] text-[var(--status-healthy)] border-[var(--status-healthy)]/30'
  }
} satisfies Record<ProductStockStatus, StockStatusConfig>;
