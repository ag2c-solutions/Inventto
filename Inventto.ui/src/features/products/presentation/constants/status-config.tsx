import { CircleX, SquareCheck, TriangleAlert } from 'lucide-react';
import type { ReactNode } from 'react';

import type { ProductStockStatus } from '../../domain/entities';

export type StockStatusConfig = {
  icon: ReactNode;
  iconSmall: ReactNode;
  label: string;
};

export const STOCK_STATUS_CONFIG = {
  critical: {
    icon: <CircleX className="text-red-600 h-6 w-6" />,
    iconSmall: <CircleX className="text-red-600 h-4 w-4" />,
    label: 'Crítico'
  },
  warning: {
    icon: <TriangleAlert className="text-orange-500 h-6 w-6" />,
    iconSmall: <TriangleAlert className="text-orange-500 h-4 w-4" />,
    label: 'Atenção'
  },
  healthy: {
    icon: <SquareCheck className="text-green-600 h-6 w-6" />,
    iconSmall: <SquareCheck className="text-green-600 h-4 w-4" />,
    label: 'Saudável'
  }
} satisfies Record<ProductStockStatus, StockStatusConfig>;
