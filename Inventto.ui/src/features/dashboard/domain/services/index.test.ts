import { describe, expect, it } from 'vitest';

import { DashboardService } from '.';

describe('DashboardService', () => {
  it('should show the chart and owner-only extras for the owner', () => {
    const view = DashboardService.getRoleView('owner');

    expect(view.showSalesChart).toBe(true);
    expect(view.showOwnerExtras).toBe(true);
  });

  it('should show the chart for the manager without owner extras', () => {
    const view = DashboardService.getRoleView('manager');

    expect(view.showSalesChart).toBe(true);
    expect(view.showOwnerExtras).toBe(false);
  });

  it('should hide the chart and owner extras for sales', () => {
    const view = DashboardService.getRoleView('sales');

    expect(view.showSalesChart).toBe(false);
    expect(view.showOwnerExtras).toBe(false);
  });
});
