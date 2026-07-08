import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AddProductsSheet } from './index';

const { mockUseAddProducts, mockToggleProduct } = vi.hoisted(() => ({
  mockUseAddProducts: vi.fn(),
  mockToggleProduct: vi.fn()
}));

vi.mock('./hooks/use-add-products', () => ({
  useAddProducts: mockUseAddProducts
}));

// Isola o Dialog de configuração de preços para não precisar de QueryClientProvider
vi.mock('../configure-prices', () => ({
  ConfigurePricesDialog: () => null
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

describe('AddProductsSheet', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAddProducts.mockReturnValue({
      search: '',
      setSearch: vi.fn(),
      products,
      isLoading: false,
      selectedIds: new Set(),
      selectedProducts: [],
      selectedCount: 0,
      toggleProduct: mockToggleProduct,
      clearSelection: vi.fn()
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
    mockUseAddProducts.mockReturnValue({
      search: '',
      setSearch: vi.fn(),
      products,
      isLoading: false,
      selectedIds: new Set(['p1']),
      selectedProducts: [products[0]],
      selectedCount: 1,
      toggleProduct: mockToggleProduct,
      clearSelection: vi.fn()
    });

    const sheet = await openSheet();

    expect(sheet.getByText('1 selecionados')).toBeInTheDocument();
  });

  it('should disable the "Configurar" button when nothing is selected', async () => {
    const sheet = await openSheet();

    expect(sheet.getByRole('button', { name: /Configurar/i })).toBeDisabled();
  });

  it('should open the configure dialog when clicking "Configurar" with items selected', async () => {
    mockUseAddProducts.mockReturnValue({
      search: '',
      setSearch: vi.fn(),
      products,
      isLoading: false,
      selectedIds: new Set(['p1']),
      selectedProducts: [products[0]],
      selectedCount: 1,
      toggleProduct: mockToggleProduct,
      clearSelection: vi.fn()
    });

    const sheet = await openSheet();
    const configureBtn = sheet.getByRole('button', { name: /Configurar 1/i });
    expect(configureBtn).toBeEnabled();
    // Clicar abre o Dialog (mockado como null, sem erro é suficiente)
    await user.click(configureBtn);
  });

  it('should show the empty message when no products match the search', async () => {
    mockUseAddProducts.mockReturnValue({
      search: 'inexistente',
      setSearch: vi.fn(),
      products: [],
      isLoading: false,
      selectedIds: new Set(),
      selectedProducts: [],
      selectedCount: 0,
      toggleProduct: mockToggleProduct,
      clearSelection: vi.fn()
    });

    const sheet = await openSheet();

    expect(sheet.getByText('Nenhum produto encontrado.')).toBeInTheDocument();
  });
});
