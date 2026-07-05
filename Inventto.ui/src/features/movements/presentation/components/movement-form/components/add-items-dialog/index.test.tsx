import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AddItemsDialog } from '.';

const { mockUseMovementForm, mockUseIsMobile } = vi.hoisted(() => ({
  mockUseMovementForm: vi.fn(),
  mockUseIsMobile: vi.fn()
}));

vi.mock('../../hooks/use-movement-form', () => ({
  useMovementForm: mockUseMovementForm
}));

vi.mock('@/shared/hooks/use-is-mobile', () => ({
  useIsMobile: mockUseIsMobile
}));

window.HTMLElement.prototype.scrollIntoView = vi.fn();

function buildForm(type: 'entry' | 'withdrawal', items: unknown[] = []) {
  return {
    watch: (field: string) => (field === 'type' ? type : items)
  };
}

const simpleProduct = {
  id: 'prod-1',
  name: 'Lenço de Seda',
  sku: 'LS-1',
  stock: 10,
  hasVariants: false,
  variants: [],
  allImages: []
};

const productWithVariants = {
  id: 'prod-2',
  name: 'Camisa Social',
  sku: 'CS-1',
  stock: 20,
  hasVariants: true,
  variants: [
    {
      id: 'var-1',
      sku: 'CS-1-BR',
      stock: 12,
      options: [{ name: 'Cor', value: 'Branco' }]
    }
  ],
  allImages: []
};

describe('AddItemsDialog', () => {
  const toggleDialog = vi.fn();
  const addItem = vi.fn();
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseIsMobile.mockReturnValue(false);
  });

  it('should render nothing when there is no selected product', () => {
    mockUseMovementForm.mockReturnValue({
      isDialogOpen: true,
      form: buildForm('entry'),
      actions: { toggleDialog, addItem },
      selectedProduct: null,
      editingItem: null,
      editingIndex: null
    });

    const { container } = render(<AddItemsDialog />);

    expect(container).toBeEmptyDOMElement();
  });

  it('should render a single row for a product without variants and add the item', async () => {
    mockUseMovementForm.mockReturnValue({
      isDialogOpen: true,
      form: buildForm('entry'),
      actions: { toggleDialog, addItem },
      selectedProduct: simpleProduct,
      editingItem: null,
      editingIndex: null
    });

    render(<AddItemsDialog />);

    expect(
      screen.getByText('Adicionar item: Lenço de Seda')
    ).toBeInTheDocument();
    expect(screen.getByText('Produto sem variações')).toBeInTheDocument();

    const quantityInput = screen.getByPlaceholderText('0');
    await user.type(quantityInput, '3');

    expect(screen.getByRole('button', { name: 'Confirmar' })).toBeEnabled();

    await user.click(screen.getByRole('button', { name: 'Confirmar' }));

    expect(addItem).toHaveBeenCalledWith([
      expect.objectContaining({ productId: 'prod-1', quantity: 3 })
    ]);
  });

  it('should render one row per variant for a product with variants', () => {
    mockUseMovementForm.mockReturnValue({
      isDialogOpen: true,
      form: buildForm('entry'),
      actions: { toggleDialog, addItem },
      selectedProduct: productWithVariants,
      editingItem: null,
      editingIndex: null
    });

    render(<AddItemsDialog />);

    expect(screen.getByText('Variantes (1)')).toBeInTheDocument();
    expect(screen.getByText('Branco')).toBeInTheDocument();
  });

  it('should disable confirm until a quantity is filled', () => {
    mockUseMovementForm.mockReturnValue({
      isDialogOpen: true,
      form: buildForm('entry'),
      actions: { toggleDialog, addItem },
      selectedProduct: simpleProduct,
      editingItem: null,
      editingIndex: null
    });

    render(<AddItemsDialog />);

    expect(screen.getByRole('button', { name: 'Confirmar' })).toBeDisabled();
  });

  it('should call actions.toggleDialog(false) when cancel is clicked', async () => {
    mockUseMovementForm.mockReturnValue({
      isDialogOpen: true,
      form: buildForm('entry'),
      actions: { toggleDialog, addItem },
      selectedProduct: simpleProduct,
      editingItem: null,
      editingIndex: null
    });

    render(<AddItemsDialog />);

    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(toggleDialog).toHaveBeenCalledWith(false);
  });

  it('should show "Editar item" as the title when editing an existing item', () => {
    mockUseMovementForm.mockReturnValue({
      isDialogOpen: true,
      form: buildForm('entry'),
      actions: { toggleDialog, addItem },
      selectedProduct: simpleProduct,
      editingItem: {
        productId: 'prod-1',
        variantId: null,
        quantity: 2,
        currentStock: 10,
        unitCost: 5,
        unitPrice: 0
      },
      editingIndex: 0
    });

    render(<AddItemsDialog />);

    expect(screen.getByText('Editar item: Lenço de Seda')).toBeInTheDocument();
  });
});
