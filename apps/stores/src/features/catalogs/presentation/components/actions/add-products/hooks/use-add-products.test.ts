import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useAddProducts } from './use-add-products';

const { mockUseAvailableProductsQuery } = vi.hoisted(() => ({
  mockUseAvailableProductsQuery: vi.fn()
}));

vi.mock('../../../../hooks/use-queries', () => ({
  useAvailableProductsQuery: mockUseAvailableProductsQuery
}));

const products = [
  {
    id: 'p1',
    name: 'Cadeira',
    sku: 'CAD-1',
    alreadyAdded: false,
    hasVariants: false,
    variants: []
  },
  {
    id: 'p2',
    name: 'Mesa',
    sku: 'MES-1',
    alreadyAdded: true,
    hasVariants: false,
    variants: []
  }
];

describe('useAddProducts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAvailableProductsQuery.mockReturnValue({
      data: products,
      isLoading: false
    });
  });

  it('should filter products by name or sku', () => {
    const { result } = renderHook(() => useAddProducts('cat-1'));

    act(() => result.current.setSearch('mesa'));

    expect(result.current.products).toEqual([products[1]]);
  });

  it('should toggle product selection', () => {
    const { result } = renderHook(() => useAddProducts('cat-1'));

    act(() => result.current.toggleProduct('p1'));
    expect(result.current.selectedCount).toBe(1);

    act(() => result.current.toggleProduct('p1'));
    expect(result.current.selectedCount).toBe(0);
  });

  it('should expose selectedProducts objects matching the selection', () => {
    const { result } = renderHook(() => useAddProducts('cat-1'));

    act(() => result.current.toggleProduct('p1'));

    expect(result.current.selectedProducts).toEqual([products[0]]);
    expect(result.current.selectedCount).toBe(1);
  });

  it('should clear selection via clearSelection()', () => {
    const { result } = renderHook(() => useAddProducts('cat-1'));

    act(() => result.current.toggleProduct('p1'));
    expect(result.current.selectedCount).toBe(1);

    act(() => result.current.clearSelection());
    expect(result.current.selectedCount).toBe(0);
    expect(result.current.selectedProducts).toEqual([]);
  });
});
