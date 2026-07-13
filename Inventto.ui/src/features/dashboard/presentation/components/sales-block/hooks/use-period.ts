import { useState } from 'react';

import type { SalesPeriod } from '../../../../domain/entities';

export function usePeriod(defaultPeriod: SalesPeriod = '30d') {
  const [period, setPeriod] = useState<SalesPeriod>(defaultPeriod);

  return { period, setPeriod };
}
