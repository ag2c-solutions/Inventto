import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { MovementBatchList } from '.';

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

function buildForm(type: 'entry' | 'withdrawal', items: unknown[]) {
  return {
    watch: (field: string) => (field === 'type' ? type : items)
  };
}

const baseItem = {
  productId: 'prod-1',
  variantId: null,
  productName: 'Camisa Social',
  sku: 'CS-1',
  currentStock: 5,
  unitCost: 10,
  unitPrice: 20,
  quantity: 2
};

describe('MovementBatchList', () => {
  const editItem = vi.fn();
  const removeItem = vi.fn();
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseIsMobile.mockReturnValue(false);
  });

  it('should render nothing when there are no items', () => {
    mockUseMovementForm.mockReturnValue({
      form: buildForm('entry', []),
      actions: { editItem, removeItem }
    });

    const { container } = render(<MovementBatchList />);

    expect(container).toBeEmptyDOMElement();
  });

  it('should render the desktop table with product info and totals', () => {
    mockUseMovementForm.mockReturnValue({
      form: buildForm('entry', [baseItem]),
      actions: { editItem, removeItem }
    });

    render(<MovementBatchList />);

    expect(screen.getByText('Camisa Social')).toBeInTheDocument();
    expect(screen.getByText('CS-1')).toBeInTheDocument();
    expect(screen.getByText('Custo total')).toBeInTheDocument();
    expect(screen.getByText('R$ 20,00')).toBeInTheDocument();
  });

  it('should label the total column as "Valor total" for withdrawals', () => {
    mockUseMovementForm.mockReturnValue({
      form: buildForm('withdrawal', [{ ...baseItem, quantity: 2 }]),
      actions: { editItem, removeItem }
    });

    render(<MovementBatchList />);

    expect(screen.getByText('Valor total')).toBeInTheDocument();
    expect(screen.getByText('R$ 40,00')).toBeInTheDocument();
  });

  it('should show an insufficient stock warning for withdrawals exceeding current stock', () => {
    mockUseMovementForm.mockReturnValue({
      form: buildForm('withdrawal', [
        { ...baseItem, quantity: 10, currentStock: 5 }
      ]),
      actions: { editItem, removeItem }
    });

    render(<MovementBatchList />);

    expect(
      screen.getByText('Estoque insuficiente — há 5 disponível.')
    ).toBeInTheDocument();
  });

  it('should call actions.editItem when the edit button is clicked', async () => {
    mockUseMovementForm.mockReturnValue({
      form: buildForm('entry', [baseItem]),
      actions: { editItem, removeItem }
    });

    render(<MovementBatchList />);

    await user.click(screen.getByRole('button', { name: /Editar/ }));

    expect(editItem).toHaveBeenCalledWith(0);
  });

  it('should ask for confirmation before removing and call actions.removeItem on confirm', async () => {
    mockUseMovementForm.mockReturnValue({
      form: buildForm('entry', [baseItem]),
      actions: { editItem, removeItem }
    });

    render(<MovementBatchList />);

    await user.click(screen.getByRole('button', { name: /^Remover$/ }));

    expect(screen.getByText('Remover este item?')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Remover' }));

    expect(removeItem).toHaveBeenCalledWith(0);
  });

  it('should cancel the removal when "Manter" is clicked', async () => {
    mockUseMovementForm.mockReturnValue({
      form: buildForm('entry', [baseItem]),
      actions: { editItem, removeItem }
    });

    render(<MovementBatchList />);

    await user.click(screen.getByRole('button', { name: /^Remover$/ }));
    await user.click(screen.getByRole('button', { name: 'Manter' }));

    expect(removeItem).not.toHaveBeenCalled();
    expect(screen.queryByText('Remover este item?')).not.toBeInTheDocument();
  });

  it('should render the mobile card layout when isMobile is true', () => {
    mockUseIsMobile.mockReturnValue(true);
    mockUseMovementForm.mockReturnValue({
      form: buildForm('entry', [baseItem]),
      actions: { editItem, removeItem }
    });

    render(<MovementBatchList />);

    expect(screen.getByText('Camisa Social')).toBeInTheDocument();
    expect(screen.getByText('Qtd.')).toBeInTheDocument();
  });
});
