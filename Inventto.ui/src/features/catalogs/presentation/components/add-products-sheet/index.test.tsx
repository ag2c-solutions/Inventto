import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AddProductsSheet } from './index';

const { mockUseAddProductsSheet, mockToggleProduct, mockConfirmSelection } =
  vi.hoisted(() => ({
    mockUseAddProductsSheet: vi.fn(),
    mockToggleProduct: vi.fn(),
    mockConfirmSelection: vi.fn()
  }));

vi.mock('./hooks/use-add-products-sheet', () => ({
  useAddProductsSheet: mockUseAddProductsSheet
}));

vi.mock('@/features/permissions', () => ({
  ActionButton: ({
    action: _action,
    children,
    ...props
  }: React.ComponentProps<'button'> & { action: string }) => (
    <button type="button" {...props}>
      {children}
    </button>
  )
}));

const products = [
  { id: 'p1', name: 'Cadeira', sku: 'CAD-1', alreadyAdded: false },
  { id: 'p2', name: 'Mesa', sku: 'MES-1', alreadyAdded: true }
];

describe('AddProductsSheet', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAddProductsSheet.mockReturnValue({
      search: '',
      setSearch: vi.fn(),
      products,
      isLoading: false,
      selectedIds: new Set(),
      selectedCount: 0,
      toggleProduct: mockToggleProduct,
      confirmSelection: mockConfirmSelection,
      isConfirming: false
    });
  });

  async function openSheet() {
    render(<AddProductsSheet catalogId="cat-1" />);
    await user.click(
      screen.getByRole('button', { name: 'Adicionar produtos' })
    );
    return within(screen.getByRole('dialog'));
  }

  it('should disable the checkbox and show "Já adicionado" for products already in the catalog', async () => {
    const sheet = await openSheet();

    const alreadyAddedRow = sheet.getByText('Mesa').closest('label')!;
    expect(
      within(alreadyAddedRow).getByText('Já adicionado')
    ).toBeInTheDocument();
    expect(within(alreadyAddedRow).getByRole('checkbox')).toBeDisabled();

    const availableRow = sheet.getByText('Cadeira').closest('label')!;
    expect(within(availableRow).getByRole('checkbox')).toBeEnabled();
  });

  it('should toggle a product when its checkbox is clicked', async () => {
    const sheet = await openSheet();

    const availableRow = sheet.getByText('Cadeira').closest('label')!;
    await user.click(within(availableRow).getByRole('checkbox'));

    expect(mockToggleProduct).toHaveBeenCalledWith('p1');
  });

  it('should show the selected count', async () => {
    mockUseAddProductsSheet.mockReturnValue({
      search: '',
      setSearch: vi.fn(),
      products,
      isLoading: false,
      selectedIds: new Set(['p1']),
      selectedCount: 1,
      toggleProduct: mockToggleProduct,
      confirmSelection: mockConfirmSelection,
      isConfirming: false
    });

    const sheet = await openSheet();

    expect(sheet.getByText('1 selecionados')).toBeInTheDocument();
  });

  it('should disable the confirm button when nothing is selected', async () => {
    const sheet = await openSheet();

    expect(
      sheet.getByRole('button', { name: 'Adicionar ao catálogo' })
    ).toBeDisabled();
  });

  it('should confirm the selection when clicking "Adicionar ao catálogo"', async () => {
    mockUseAddProductsSheet.mockReturnValue({
      search: '',
      setSearch: vi.fn(),
      products,
      isLoading: false,
      selectedIds: new Set(['p1']),
      selectedCount: 1,
      toggleProduct: mockToggleProduct,
      confirmSelection: mockConfirmSelection,
      isConfirming: false
    });

    const sheet = await openSheet();
    await user.click(
      sheet.getByRole('button', { name: 'Adicionar ao catálogo' })
    );

    expect(mockConfirmSelection).toHaveBeenCalled();
  });

  it('should show the empty message when no products match the search', async () => {
    mockUseAddProductsSheet.mockReturnValue({
      search: 'inexistente',
      setSearch: vi.fn(),
      products: [],
      isLoading: false,
      selectedIds: new Set(),
      selectedCount: 0,
      toggleProduct: mockToggleProduct,
      confirmSelection: mockConfirmSelection,
      isConfirming: false
    });

    const sheet = await openSheet();

    expect(sheet.getByText('Nenhum produto encontrado.')).toBeInTheDocument();
  });
});
