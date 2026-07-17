import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { storefrontFactory } from '../../../../tests/factories/storefront.factory';

import { usePublishPrereqs } from './use-publish-prereqs';

const { mockUseOrganizationQuery } = vi.hoisted(() => ({
  mockUseOrganizationQuery: vi.fn()
}));

vi.mock('@/features/organizations', () => ({
  useOrganizationQuery: mockUseOrganizationQuery
}));

const completeSettings = {
  identity: { displayName: 'Loja' },
  operational: { timezone: 'America/Sao_Paulo' },
  sales: { acceptOrdersOutsideHours: false },
  schedule: {
    mon: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
    tue: { isOpen: false, openTime: '', closeTime: '' },
    wed: { isOpen: false, openTime: '', closeTime: '' },
    thu: { isOpen: false, openTime: '', closeTime: '' },
    fri: { isOpen: false, openTime: '', closeTime: '' },
    sat: { isOpen: false, openTime: '', closeTime: '' },
    sun: { isOpen: false, openTime: '', closeTime: '' }
  }
};

describe('usePublishPrereqs', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should mark every item as done when all prereqs are fulfilled', () => {
    mockUseOrganizationQuery.mockReturnValue({
      data: { settings: completeSettings },
      isLoading: false
    });
    const storefront = storefrontFactory.build({
      catalogId: 'cat-1',
      whatsapp: '11999998888'
    });

    const { result } = renderHook(() => usePublishPrereqs(storefront));

    expect(result.current.allDone).toBe(true);
    expect(result.current.items.every((item) => item.done)).toBe(true);
    expect(result.current.firstPendingHref).toBeUndefined();
  });

  it('should mark the catalog item as pending when catalogId is absent', () => {
    mockUseOrganizationQuery.mockReturnValue({
      data: { settings: completeSettings },
      isLoading: false
    });
    const storefront = storefrontFactory.build({
      catalogId: undefined,
      whatsapp: '11999998888'
    });

    const { result } = renderHook(() => usePublishPrereqs(storefront));

    const catalogItem = result.current.items.find((i) => i.key === 'catalog');
    expect(catalogItem?.done).toBe(false);
    expect(result.current.allDone).toBe(false);
    expect(result.current.firstPendingHref).toBe(catalogItem?.href);
  });

  it('should mark the hours item as pending when the organization has no schedule/timezone', () => {
    mockUseOrganizationQuery.mockReturnValue({
      data: undefined,
      isLoading: false
    });
    const storefront = storefrontFactory.build({
      catalogId: 'cat-1',
      whatsapp: '11999998888'
    });

    const { result } = renderHook(() => usePublishPrereqs(storefront));

    const hoursItem = result.current.items.find((i) => i.key === 'hours');
    expect(hoursItem?.done).toBe(false);
    expect(hoursItem?.href).toBe('/settings?tab=schedule');
  });
});
