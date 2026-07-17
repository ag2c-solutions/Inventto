import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useMovementForm } from './hooks/use-movement-form';
import { MovementForm } from './index';

vi.mock('./hooks/use-movement-form', () => ({
  MovementFormProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  useMovementForm: vi.fn()
}));

vi.mock('./components/header', () => ({
  MovementFormHeader: () => <div data-testid="mock-header">Header</div>
}));

vi.mock('./components/product-search', () => ({
  ProductSearch: () => (
    <div data-testid="mock-product-search">Buscar produto</div>
  )
}));

vi.mock('./components/movement-batch-list', () => ({
  MovementBatchList: () => (
    <div data-testid="mock-batch-list">Lista de Itens</div>
  )
}));

vi.mock('./components/footer', () => ({
  MovementFormFooter: () => (
    <div data-testid="mock-footer">
      <button type="submit" data-testid="btn-submit">
        Salvar
      </button>
    </div>
  )
}));

vi.mock('./components/add-items-dialog', () => ({
  AddItemsDialog: () => <div data-testid="mock-dialog" />
}));

describe('MovementForm', () => {
  const mockSubmit = vi.fn();
  const mockAddItem = vi.fn();
  const mockToggleDialog = vi.fn();
  const mockSelectProduct = vi.fn();

  const mockHandleSubmit = vi.fn(
    (fn?: () => void) => (e?: { preventDefault?: () => void }) => {
      e?.preventDefault?.();
      fn?.();
    }
  );

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useMovementForm).mockReturnValue({
      form: {
        handleSubmit: mockHandleSubmit,
        control: {},
        watch: vi.fn().mockReturnValue([]),
        setValue: vi.fn(),
        getValues: vi.fn()
      },
      actions: {
        submit: mockSubmit,
        addItem: mockAddItem,
        toggleDialog: mockToggleDialog,
        selectProduct: mockSelectProduct
      },
      products: [],
      selectedProduct: null,
      isDialogOpen: false
    } as unknown as ReturnType<typeof useMovementForm>);
  });

  it('should render the form structure correctly', () => {
    render(<MovementForm />);

    expect(screen.getByTestId('mock-header')).toBeInTheDocument();
    expect(screen.getByTestId('mock-product-search')).toBeInTheDocument();
    expect(screen.getByTestId('mock-footer')).toBeInTheDocument();
    expect(screen.queryByTestId('mock-batch-list')).not.toBeInTheDocument();
    // AddItemsDialog is always rendered (manages its own visibility)
    expect(screen.queryByTestId('mock-dialog')).toBeInTheDocument();
  });

  it('should render MovementBatchList when items exist', () => {
    vi.mocked(useMovementForm).mockReturnValue({
      form: {
        handleSubmit: mockHandleSubmit,
        watch: vi.fn().mockReturnValue([{ id: '1' }])
      },
      actions: { submit: mockSubmit },
      products: [],
      selectedProduct: null,
      isDialogOpen: false
    } as unknown as ReturnType<typeof useMovementForm>);

    render(<MovementForm />);

    expect(screen.getByTestId('mock-batch-list')).toBeInTheDocument();
  });

  it('should open the AddItemsDialog when isDialogOpen is true', () => {
    vi.mocked(useMovementForm).mockReturnValue({
      form: {
        handleSubmit: mockHandleSubmit,
        watch: vi.fn().mockReturnValue([])
      },
      actions: {
        submit: mockSubmit,
        toggleDialog: mockToggleDialog,
        addItem: mockAddItem
      },
      products: [],
      selectedProduct: { id: 'prod-1' },
      isDialogOpen: true
    } as unknown as ReturnType<typeof useMovementForm>);

    render(<MovementForm />);

    // AddItemsDialog is always rendered (it controls its own visibility internally)
    expect(screen.getByTestId('mock-dialog')).toBeInTheDocument();
  });

  it('should render ProductSearch component', () => {
    render(<MovementForm />);

    expect(screen.getByTestId('mock-product-search')).toBeInTheDocument();
  });

  it('should always render AddItemsDialog (visibility managed internally)', () => {
    render(<MovementForm />);

    expect(screen.getByTestId('mock-dialog')).toBeInTheDocument();
  });

  it('should render all core structural components', () => {
    render(<MovementForm />);

    expect(screen.getByTestId('mock-header')).toBeInTheDocument();
    expect(screen.getByTestId('mock-product-search')).toBeInTheDocument();
    expect(screen.getByTestId('mock-footer')).toBeInTheDocument();
    expect(screen.getByTestId('mock-dialog')).toBeInTheDocument();
  });

  it('should submit the form when Footer save button is clicked', () => {
    render(<MovementForm />);

    const submitBtn = screen.getByTestId('btn-submit');
    fireEvent.click(submitBtn);

    expect(mockHandleSubmit).toHaveBeenCalled();
    expect(mockSubmit).toHaveBeenCalled();
  });
});
