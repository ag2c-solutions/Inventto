import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { catalogItemFactory } from '../../../tests/factories/catalog-item.factory';

import { CurationItem } from './index';

const {
  mockUseUser,
  mockUseCurationItem,
  mockRemoveMutate,
  mockUseRemoveCatalogItemMutation
} = vi.hoisted(() => ({
  mockUseUser: vi.fn(),
  mockUseCurationItem: vi.fn(),
  mockRemoveMutate: vi.fn(),
  mockUseRemoveCatalogItemMutation: vi.fn()
}));

vi.mock('@/features/users', () => ({
  useUser: mockUseUser
}));

vi.mock('../../hooks/use-mutations', () => ({
  useRemoveCatalogItemMutation: mockUseRemoveCatalogItemMutation
}));

vi.mock('./hooks/use-curation-item', () => ({
  useCurationItem: mockUseCurationItem
}));

describe('CurationItem', () => {
  const user = userEvent.setup();
  const item = catalogItemFactory.build({
    price: 50,
    product: {
      id: 'p1',
      name: 'Cadeira Ergonômica',
      sku: 'CAD-001',
      imageUrl: undefined
    }
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseUser.mockReturnValue({ role: 'owner' });
    mockUseRemoveCatalogItemMutation.mockReturnValue({
      mutate: mockRemoveMutate
    });
    mockUseCurationItem.mockReturnValue({
      price: 50,
      originalPrice: undefined,
      isSaving: false,
      needsPrice: false,
      handlePriceChange: vi.fn(),
      handleOriginalPriceChange: vi.fn()
    });
  });

  it('should render the product name and sku', () => {
    render(<CurationItem item={item} catalogId={item.catalogId} />);

    expect(screen.getByText('Cadeira Ergonômica')).toBeInTheDocument();
    expect(screen.getByText('CAD-001')).toBeInTheDocument();
  });

  it('should show the missing-price warning when the item needs a price', () => {
    mockUseCurationItem.mockReturnValue({
      price: 0,
      originalPrice: undefined,
      isSaving: false,
      needsPrice: true,
      handlePriceChange: vi.fn(),
      handleOriginalPriceChange: vi.fn()
    });

    render(<CurationItem item={item} catalogId={item.catalogId} />);

    expect(
      screen.getByText('Defina um preço para incluir este item.')
    ).toBeInTheDocument();
  });

  it('should show a saving indicator while the price auto-saves', () => {
    mockUseCurationItem.mockReturnValue({
      price: 50,
      originalPrice: undefined,
      isSaving: true,
      needsPrice: false,
      handlePriceChange: vi.fn(),
      handleOriginalPriceChange: vi.fn()
    });

    render(<CurationItem item={item} catalogId={item.catalogId} />);

    expect(screen.getByLabelText('Salvando…')).toBeInTheDocument();
  });

  it('should call handlePriceChange when the sale price input changes', async () => {
    const handlePriceChange = vi.fn();
    mockUseCurationItem.mockReturnValue({
      price: 50,
      originalPrice: undefined,
      isSaving: false,
      needsPrice: false,
      handlePriceChange,
      handleOriginalPriceChange: vi.fn()
    });

    render(<CurationItem item={item} catalogId={item.catalogId} />);

    await user.type(screen.getByDisplayValue('50,00'), '0');

    expect(handlePriceChange).toHaveBeenCalled();
  });

  it('should remove the item (reversible via a toast handled by the mutation) when clicking remove', async () => {
    render(<CurationItem item={item} catalogId={item.catalogId} />);

    await user.click(screen.getByRole('button', { name: 'Remover produto' }));

    expect(mockRemoveMutate).toHaveBeenCalledWith(item);
  });

  it('should hide the remove button for sales (readonly)', () => {
    mockUseUser.mockReturnValue({ role: 'sales' });

    render(<CurationItem item={item} catalogId={item.catalogId} />);

    expect(
      screen.queryByRole('button', { name: 'Remover produto' })
    ).not.toBeInTheDocument();
  });

  it('should disable price inputs for sales (readonly)', () => {
    mockUseUser.mockReturnValue({ role: 'sales' });

    render(<CurationItem item={item} catalogId={item.catalogId} />);

    expect(screen.getByDisplayValue('50,00')).toBeDisabled();
  });
});
