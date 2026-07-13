import { describe, expect, it } from 'vitest';

import { attentionSummaryDTOFactory } from '../../tests/factories/attention-summary.factory';
import { salesSummaryDTOFactory } from '../../tests/factories/sales-summary.factory';

import { AttentionSummaryMapper, SalesSummaryMapper } from '.';

describe('AttentionSummaryMapper', () => {
  it('should map the full DTO to domain for owner/manager', () => {
    const dto = attentionSummaryDTOFactory.build({
      pending_orders: 5,
      low_stock: 3,
      expiring_soon: 2
    });

    const summary = AttentionSummaryMapper.toDomain(dto);

    expect(summary).toEqual({
      pendingOrders: 5,
      lowStock: 3,
      expiringSoon: 2
    });
  });

  it('should leave pendingOrders/lowStock undefined for the sales cut', () => {
    const dto = attentionSummaryDTOFactory.build({
      pending_orders: undefined,
      low_stock: undefined,
      expiring_soon: 2
    });

    const summary = AttentionSummaryMapper.toDomain(dto);

    expect(summary.pendingOrders).toBeUndefined();
    expect(summary.lowStock).toBeUndefined();
    expect(summary.expiringSoon).toBe(2);
  });
});

describe('SalesSummaryMapper', () => {
  it('should map the full DTO to domain for the owner, including margin and inventory', () => {
    const dto = salesSummaryDTOFactory.build({
      revenue_total: 1198.2,
      sales_count: 5,
      series: [{ date: '2026-07-12', pos: 100, online: 50 }],
      trend: 12.5,
      inventory_at_cost: 18822.93,
      avg_margin: 0.9463
    });

    const summary = SalesSummaryMapper.toDomain(dto);

    expect(summary).toEqual({
      revenueTotal: 1198.2,
      salesCount: 5,
      series: [{ date: '2026-07-12', pos: 100, online: 50 }],
      trend: 12.5,
      inventoryAtCost: 18822.93,
      avgMargin: 0.9463,
      ownSalesToday: undefined
    });
  });

  it('should leave inventoryAtCost/avgMargin undefined for the manager cut', () => {
    const dto = salesSummaryDTOFactory.build({
      inventory_at_cost: undefined,
      avg_margin: undefined
    });

    const summary = SalesSummaryMapper.toDomain(dto);

    expect(summary.inventoryAtCost).toBeUndefined();
    expect(summary.avgMargin).toBeUndefined();
  });

  it('should map only ownSalesToday for the sales cut', () => {
    const dto = salesSummaryDTOFactory.build({
      revenue_total: undefined,
      sales_count: undefined,
      series: undefined,
      trend: undefined,
      inventory_at_cost: undefined,
      avg_margin: undefined,
      own_sales_today: { count: 3, total: 318.8 }
    });

    const summary = SalesSummaryMapper.toDomain(dto);

    expect(summary).toEqual({
      revenueTotal: undefined,
      salesCount: undefined,
      series: undefined,
      trend: undefined,
      inventoryAtCost: undefined,
      avgMargin: undefined,
      ownSalesToday: { count: 3, total: 318.8 }
    });
  });
});
