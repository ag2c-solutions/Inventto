import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ProductSearch } from '.';

const { mockUseMovementForm } = vi.hoisted(() => ({
  mockUseMovementForm: vi.fn()
}));

vi.mock('../../hooks/use-movement-form', () => ({
  useMovementForm: mockUseMovementForm
}));

window.PointerEvent = MouseEvent as typeof PointerEvent;
window.HTMLElement.prototype.scrollIntoView = vi.fn();
window.HTMLElement.prototype.hasPointerCapture = vi.fn();
window.HTMLElement.prototype.releasePointerCapture = vi.fn();

function buildForm(type: 'entry' | 'withdrawal') {
  return { watch: () => type };
}

const inStockProduct = {
  id: 'prod-1',
  name: 'Camisa Social',
  sku: 'CS-1',
  stock: 10,
  hasVariants: false,
  variants: [],
  allImages: []
};

const outOfStockProduct = {
  id: 'prod-2',
  name: 'Lenço de Seda',
  sku: 'LS-1',
  stock: 0,
  hasVariants: false,
  variants: [],
  allImages: []
};

describe('ProductSearch', () => {
  const selectProduct = vi.fn();
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show a loading label and disable the trigger while products load', () => {
    mockUseMovementForm.mockReturnValue({
      form: buildForm('entry'),
      products: [],
      actions: { selectProduct },
      isLoadingProducts: true
    });

    render(<ProductSearch />);

    expect(screen.getByRole('combobox')).toBeDisabled();
    expect(screen.getByText('Carregando…')).toBeInTheDocument();
  });

  it('should list products and select one on click', async () => {
    mockUseMovementForm.mockReturnValue({
      form: buildForm('entry'),
      products: [inStockProduct],
      actions: { selectProduct },
      isLoadingProducts: false
    });

    render(<ProductSearch />);

    await user.click(screen.getByRole('combobox'));

    const option = await screen.findByText('Camisa Social');
    await user.click(option);

    expect(selectProduct).toHaveBeenCalledWith(inStockProduct);
  });

  it('should disable out-of-stock products when the movement is a withdrawal', async () => {
    mockUseMovementForm.mockReturnValue({
      form: buildForm('withdrawal'),
      products: [outOfStockProduct],
      actions: { selectProduct },
      isLoadingProducts: false
    });

    render(<ProductSearch />);

    await user.click(screen.getByRole('combobox'));

    expect(
      await screen.findByText('Sem estoque disponível')
    ).toBeInTheDocument();

    await user.click(screen.getByText('Lenço de Seda'));

    expect(selectProduct).not.toHaveBeenCalled();
  });

  it('should not restrict out-of-stock products for entry movements', async () => {
    mockUseMovementForm.mockReturnValue({
      form: buildForm('entry'),
      products: [outOfStockProduct],
      actions: { selectProduct },
      isLoadingProducts: false
    });

    render(<ProductSearch />);

    await user.click(screen.getByRole('combobox'));

    const option = await screen.findByText('Lenço de Seda');
    await user.click(option);

    expect(selectProduct).toHaveBeenCalledWith(outOfStockProduct);
  });
});
