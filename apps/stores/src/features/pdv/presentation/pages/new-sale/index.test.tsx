import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { pdvProductFactory } from '../../../tests/factories/pdv-product.factory';
import { useCartStore } from '../../stores/cart-store';

import { NewSalePage } from './index';

const {
  mockUsePdvCatalogQuery,
  mockUsePdvProductsQuery,
  mockUseCategoriesQuery
} = vi.hoisted(() => ({
  mockUsePdvCatalogQuery: vi.fn(),
  mockUsePdvProductsQuery: vi.fn(),
  mockUseCategoriesQuery: vi.fn()
}));

vi.mock('../../hooks/use-queries', () => ({
  usePdvCatalogQuery: mockUsePdvCatalogQuery,
  usePdvProductsQuery: mockUsePdvProductsQuery
}));

vi.mock('@/features/categories', () => ({
  useCategoriesQuery: mockUseCategoriesQuery
}));

vi.mock('../../components/no-catalog-block', () => ({
  NoCatalogBlock: () => <div data-testid="no-catalog-block" />
}));

vi.mock('../../components/add-product-dialog', () => ({
  AddProductDialog: ({
    product
  }: {
    product: { name: string } | null;
    onOpenChange: (open: boolean) => void;
  }) =>
    product ? <div data-testid="add-product-dialog">{product.name}</div> : null
}));

vi.mock('../../components/cart-sheet', () => ({
  CartSheet: ({
    open
  }: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
  }) => (open ? <div data-testid="cart-sheet" /> : null)
}));

describe('NewSalePage', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    useCartStore.setState({ items: [] });
    mockUseCategoriesQuery.mockReturnValue({ data: [] });
  });

  it('should show the block state when there is no catalog linked', () => {
    mockUsePdvCatalogQuery.mockReturnValue({ data: null, isLoading: false });
    mockUsePdvProductsQuery.mockReturnValue({
      data: undefined,
      isLoading: false
    });

    render(<NewSalePage />);

    expect(screen.getByTestId('no-catalog-block')).toBeInTheDocument();
  });

  it('should show the block state when the linked catalog has no items', () => {
    mockUsePdvCatalogQuery.mockReturnValue({
      data: { id: 'cat-1', name: 'Loja Física' },
      isLoading: false
    });
    mockUsePdvProductsQuery.mockReturnValue({ data: [], isLoading: false });

    render(<NewSalePage />);

    expect(screen.getByTestId('no-catalog-block')).toBeInTheDocument();
  });

  it('should show the loading skeleton while the catalog is resolving', () => {
    mockUsePdvCatalogQuery.mockReturnValue({
      data: undefined,
      isLoading: true
    });
    mockUsePdvProductsQuery.mockReturnValue({
      data: undefined,
      isLoading: false
    });

    const { container } = render(<NewSalePage />);

    expect(
      container.querySelectorAll('[data-slot="skeleton"]').length
    ).toBeGreaterThan(0);
    expect(screen.queryByTestId('no-catalog-block')).not.toBeInTheDocument();
  });

  it('should render the product grid with the badge showing the catalog name', () => {
    const products = pdvProductFactory.buildList(2);
    mockUsePdvCatalogQuery.mockReturnValue({
      data: { id: 'cat-1', name: 'Loja Física' },
      isLoading: false
    });
    mockUsePdvProductsQuery.mockReturnValue({
      data: products,
      isLoading: false
    });

    render(<NewSalePage />);

    expect(screen.getByText(/Catálogo: Loja Física/)).toBeInTheDocument();
    expect(screen.getByText(products[0].name)).toBeInTheDocument();
    expect(screen.getByText(products[1].name)).toBeInTheDocument();
  });

  it('should show the no-result message when the search does not match', async () => {
    const products = pdvProductFactory.buildList(1, { name: 'Cadeira Gamer' });
    mockUsePdvCatalogQuery.mockReturnValue({
      data: { id: 'cat-1', name: 'Loja Física' },
      isLoading: false
    });
    mockUsePdvProductsQuery.mockReturnValue({
      data: products,
      isLoading: false
    });

    render(<NewSalePage />);

    await user.type(
      screen.getByPlaceholderText('Buscar produto ou SKU no catálogo…'),
      'inexistente'
    );

    expect(
      screen.getByText('Nenhum produto encontrado para "inexistente".')
    ).toBeInTheDocument();
  });

  it('should hide the FAB when the cart is empty', () => {
    const products = pdvProductFactory.buildList(1, {
      name: 'Cadeira Gamer',
      stock: 5,
      isOut: false
    });
    mockUsePdvCatalogQuery.mockReturnValue({
      data: { id: 'cat-1', name: 'Loja Física' },
      isLoading: false
    });
    mockUsePdvProductsQuery.mockReturnValue({
      data: products,
      isLoading: false
    });

    render(<NewSalePage />);

    expect(
      screen.queryByRole('button', { name: 'Ver venda atual' })
    ).not.toBeInTheDocument();
  });

  it('should show the FAB with the cart count once items are added', () => {
    mockUsePdvCatalogQuery.mockReturnValue({
      data: { id: 'cat-1', name: 'Loja Física' },
      isLoading: false
    });
    mockUsePdvProductsQuery.mockReturnValue({
      data: pdvProductFactory.buildList(1),
      isLoading: false
    });
    useCartStore.getState().addItem({
      productId: 'p1',
      name: 'Cadeira Gamer',
      unitPrice: 1000,
      discount: 0,
      quantity: 2
    });

    render(<NewSalePage />);

    const fab = screen.getByRole('button', { name: 'Ver venda atual' });
    expect(fab).toBeInTheDocument();
    expect(fab).toHaveTextContent('2');
  });

  it('should open the cart sheet when the FAB is clicked', async () => {
    mockUsePdvCatalogQuery.mockReturnValue({
      data: { id: 'cat-1', name: 'Loja Física' },
      isLoading: false
    });
    mockUsePdvProductsQuery.mockReturnValue({
      data: pdvProductFactory.buildList(1),
      isLoading: false
    });
    useCartStore.getState().addItem({
      productId: 'p1',
      name: 'Cadeira Gamer',
      unitPrice: 1000,
      discount: 0,
      quantity: 1
    });

    render(<NewSalePage />);

    expect(screen.queryByTestId('cart-sheet')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Ver venda atual' }));

    expect(screen.getByTestId('cart-sheet')).toBeInTheDocument();
  });

  it('should open the add-product dialog for the clicked product', async () => {
    const products = pdvProductFactory.buildList(1, {
      name: 'Cadeira Gamer',
      stock: 5,
      isOut: false
    });
    mockUsePdvCatalogQuery.mockReturnValue({
      data: { id: 'cat-1', name: 'Loja Física' },
      isLoading: false
    });
    mockUsePdvProductsQuery.mockReturnValue({
      data: products,
      isLoading: false
    });

    render(<NewSalePage />);

    expect(screen.queryByTestId('add-product-dialog')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Adicionar produto' }));

    expect(screen.getByTestId('add-product-dialog')).toHaveTextContent(
      'Cadeira Gamer'
    );
  });
});
