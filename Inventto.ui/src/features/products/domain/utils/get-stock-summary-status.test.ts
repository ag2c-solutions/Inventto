import { describe, expect, it } from 'vitest';

import { getStockSummaryStatus } from './get-stock-summary-status';

describe('getStockSummaryStatus (pior caso — RN050)', () => {
  it('deve retornar zeroed quando há ao menos uma variante zerada (pior caso)', () => {
    expect(
      getStockSummaryStatus({ zeroed: 1, critical: 3, warning: 5, healthy: 2 })
    ).toBe('zeroed');
  });

  it('deve retornar critical quando não há zerada mas há crítica', () => {
    expect(
      getStockSummaryStatus({ zeroed: 0, critical: 3, warning: 5, healthy: 2 })
    ).toBe('critical');
  });

  it('deve retornar warning quando só há atenção e saudável', () => {
    expect(
      getStockSummaryStatus({ zeroed: 0, critical: 0, warning: 2, healthy: 5 })
    ).toBe('warning');
  });

  it('deve retornar healthy quando todos os demais estados são 0', () => {
    expect(
      getStockSummaryStatus({ zeroed: 0, critical: 0, warning: 0, healthy: 10 })
    ).toBe('healthy');
  });
});
