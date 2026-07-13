import { describe, expect, it } from 'vitest';

import { attentionSummaryDTOFactory } from '../../tests/factories/attention-summary.factory';

import { AttentionSummaryMapper } from '.';

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
