import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { catalogItemFactory } from '../../../../tests/factories/catalog-item.factory';

import { useCurationItem } from './use-curation-item';

const { mockMutate, mockUseUpdateCatalogItemPriceMutation } = vi.hoisted(
  () => ({
    mockMutate: vi.fn(),
    mockUseUpdateCatalogItemPriceMutation: vi.fn()
  })
);

vi.mock('../../../hooks/use-mutations', () => ({
  useUpdateCatalogItemPriceMutation: mockUseUpdateCatalogItemPriceMutation
}));

describe('useCurationItem', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    mockUseUpdateCatalogItemPriceMutation.mockReturnValue({
      mutate: mockMutate,
      isPending: false
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should flag the item as needing a price when price is 0', () => {
    const item = catalogItemFactory.build({ price: 0 });

    const { result } = renderHook(() => useCurationItem(item, item.catalogId));

    expect(result.current.needsPrice).toBe(true);
  });

  it('should debounce price changes before saving', () => {
    const item = catalogItemFactory.build({ price: 10 });

    const { result } = renderHook(() => useCurationItem(item, item.catalogId));

    act(() => {
      result.current.handlePriceChange(20);
    });

    expect(mockMutate).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(600);
    });

    expect(mockMutate).toHaveBeenCalledWith({
      id: item.id,
      price: 20,
      originalPrice: item.originalPrice
    });
  });

  it('should not save while the new price is not positive', () => {
    const item = catalogItemFactory.build({ price: 10 });

    const { result } = renderHook(() => useCurationItem(item, item.catalogId));

    act(() => {
      result.current.handlePriceChange(0);
      vi.advanceTimersByTime(600);
    });

    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('should save the original price alongside the current price', () => {
    const item = catalogItemFactory.build({
      price: 10,
      originalPrice: undefined
    });

    const { result } = renderHook(() => useCurationItem(item, item.catalogId));

    act(() => {
      result.current.handleOriginalPriceChange(15);
      vi.advanceTimersByTime(600);
    });

    expect(mockMutate).toHaveBeenCalledWith({
      id: item.id,
      price: item.price,
      originalPrice: 15
    });
  });
});
