import { describe, expect, it } from 'vitest';

import { getStockSummaryStatus } from './get-stock-summary-status';

describe('getStockSummaryStatus', () => {
  it('deve retornar critical quando summary.critical > 0, independente dos outros valores', () => {
    expect(getStockSummaryStatus({ critical: 3, warning: 5, healthy: 2 })).toBe(
      'critical'
    );
  });

  it('deve retornar warning quando summary.critical === 0 e summary.warning > 0', () => {
    expect(getStockSummaryStatus({ critical: 0, warning: 2, healthy: 5 })).toBe(
      'warning'
    );
  });

  it('deve retornar healthy quando tanto critical quanto warning são 0', () => {
    expect(
      getStockSummaryStatus({ critical: 0, warning: 0, healthy: 10 })
    ).toBe('healthy');
  });
});
