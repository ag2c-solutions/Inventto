import { describe, expect, it } from 'vitest';

import { DashboardService } from '.';

describe('DashboardService', () => {
  it('should return the full attention/activity cards and chart for the owner, plus owner-only extras', () => {
    const view = DashboardService.getRoleView('owner');

    expect(view.attentionCards).toHaveLength(3);
    expect(view.activityCards).toEqual([
      'Movimentações recentes',
      'Últimos pedidos'
    ]);
    expect(view.showSalesChart).toBe(true);
    expect(view.showOwnerExtras).toBe(true);
  });

  it('should return the full attention/activity cards for the manager without owner extras', () => {
    const view = DashboardService.getRoleView('manager');

    expect(view.attentionCards).toHaveLength(3);
    expect(view.showSalesChart).toBe(true);
    expect(view.showOwnerExtras).toBe(false);
  });

  it('should return the reduced attention/activity cards for sales, without the chart or owner extras', () => {
    const view = DashboardService.getRoleView('sales');

    expect(view.attentionCards).toEqual(['Pedidos do pool perto de expirar']);
    expect(view.activityCards).toEqual(['Suas últimas vendas']);
    expect(view.showSalesChart).toBe(false);
    expect(view.showOwnerExtras).toBe(false);
  });
});
