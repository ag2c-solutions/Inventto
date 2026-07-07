import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useAddProductsSheet } from './use-add-products-sheet';

const {
  mockMutateAsync,
  mockUseAddCatalogItemsMutation,
  mockUseAvailableProductsQuery
} = vi.hoisted(() => ({
  mockMutateAsync: vi.fn(),
  mockUseAddCatalogItemsMutation: vi.fn(),
  mockUseAvailableProductsQuery: vi.fn()
}));

vi.mock('../../../hooks/use-mutations', () => ({
  useAddCatalogItemsMutation: mockUseAddCatalogItemsMutation
}));

vi.mock('../../../hooks/use-queries', () => ({
  useAvailableProductsQuery: mockUseAvailableProductsQuery
}));

const products = [
  { id: 'p1', name: 'Cadeira', sku: 'CAD-1', alreadyAdded: false },
  { id: 'p2', name: 'Mesa', sku: 'MES-1', alreadyAdded: true }
];

describe('useAddProductsSheet', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAvailableProductsQuery.mockReturnValue({
      data: products,
      isLoading: false
    });
    mockUseAddCatalogItemsMutation.mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false
    });
  });

  it('should filter products by name or sku', () => {
    const { result } = renderHook(() => useAddProductsSheet('cat-1'));

    act(() => result.current.setSearch('mesa'));

    expect(result.current.products).toEqual([products[1]]);
  });

  it('should toggle product selection', () => {
    const { result } = renderHook(() => useAddProductsSheet('cat-1'));

    act(() => result.current.toggleProduct('p1'));
    expect(result.current.selectedCount).toBe(1);

    act(() => result.current.toggleProduct('p1'));
    expect(result.current.selectedCount).toBe(0);
  });

  it('should confirm the selection and reset it afterwards', async () => {
    const { result } = renderHook(() => useAddProductsSheet('cat-1'));

    act(() => result.current.toggleProduct('p1'));

    await act(async () => {
      await result.current.confirmSelection();
    });

    expect(mockMutateAsync).toHaveBeenCalledWith(['p1']);
    expect(result.current.selectedCount).toBe(0);
  });
});
