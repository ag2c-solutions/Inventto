import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { cartItemFactory } from '../../../tests/factories/cart-item.factory';
import { pdvProductFactory } from '../../../tests/factories/pdv-product.factory';
import { useCartStore } from '../../stores/cart-store';

import { CartSheet } from './index';

const {
  mockUsePdvCatalogQuery,
  mockUsePdvProductsQuery,
  mockUseConfirmPosSaleMutation,
  mockConfirmSale,
  mockUseIsMobile,
  mockUseUser,
  mockUseOrganizationQuery
} = vi.hoisted(() => ({
  mockUsePdvCatalogQuery: vi.fn(),
  mockUsePdvProductsQuery: vi.fn(),
  mockUseConfirmPosSaleMutation: vi.fn(),
  mockConfirmSale: vi.fn(),
  mockUseIsMobile: vi.fn(),
  mockUseUser: vi.fn(),
  mockUseOrganizationQuery: vi.fn()
}));

vi.mock('../../hooks/use-queries', () => ({
  usePdvCatalogQuery: mockUsePdvCatalogQuery,
  usePdvProductsQuery: mockUsePdvProductsQuery
}));

vi.mock('../../hooks/use-mutations', () => ({
  useConfirmPosSaleMutation: mockUseConfirmPosSaleMutation
}));

vi.mock('@/shared/hooks/use-is-mobile', () => ({
  useIsMobile: mockUseIsMobile
}));

vi.mock('@/features/users', () => ({
  useUser: mockUseUser
}));

vi.mock('@/features/organizations', () => ({
  useOrganizationQuery: mockUseOrganizationQuery
}));

vi.mock('../customer-section', () => ({
  CustomerSection: () => <div data-testid="customer-section" />
}));

describe('CartSheet', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    useCartStore.setState({ items: [] });
    mockUsePdvCatalogQuery.mockReturnValue({
      data: { id: 'cat-1', name: 'Loja Física' }
    });
    mockUsePdvProductsQuery.mockReturnValue({ data: [] });
    mockUseConfirmPosSaleMutation.mockReturnValue({
      mutate: mockConfirmSale,
      isPending: false
    });
    mockUseIsMobile.mockReturnValue(false);
    mockUseUser.mockReturnValue({
      currentOrganization: { id: 'org-1', name: 'Loja Física' }
    });
    mockUseOrganizationQuery.mockReturnValue({
      data: { settings: { identity: { logoUrl: undefined } } }
    });
  });

  it('should open as a side sheet (right) on desktop', () => {
    render(<CartSheet open onOpenChange={vi.fn()} />);

    expect(screen.getByRole('dialog').className).toContain('right-0');
  });

  it('should open as a bottom sheet on mobile', () => {
    mockUseIsMobile.mockReturnValue(true);

    render(<CartSheet open onOpenChange={vi.fn()} />);

    const sheetContent = screen.getByRole('dialog');
    expect(sheetContent.className).toContain('bottom-0');
    expect(sheetContent.className).not.toContain('right-0');
  });

  it('should show the empty state with "Ver catálogo" when the cart is empty', async () => {
    const onOpenChange = vi.fn();
    render(<CartSheet open onOpenChange={onOpenChange} />);

    expect(
      screen.getByText('Adicione produtos para iniciar a venda.')
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Ver catálogo' }));

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('should render the item count, summary and total when the cart has items', () => {
    useCartStore.setState({
      items: [
        cartItemFactory.build({
          productId: 'p1',
          variantId: undefined,
          unitPrice: 10000,
          discount: 0,
          quantity: 2
        })
      ]
    });

    render(<CartSheet open onOpenChange={vi.fn()} />);

    expect(
      screen.getByText('1 item · revise antes de confirmar.')
    ).toBeInTheDocument();
    expect(screen.getByText('Subtotal')).toBeInTheDocument();
    expect(screen.getByText('Total')).toBeInTheDocument();
  });

  it('should disable "Confirmar venda" when any item exceeds the available stock', () => {
    useCartStore.setState({
      items: [
        cartItemFactory.build({
          productId: 'p1',
          variantId: undefined,
          quantity: 5
        })
      ]
    });
    mockUsePdvProductsQuery.mockReturnValue({
      data: [
        pdvProductFactory.build({
          productId: 'p1',
          variantId: undefined,
          stock: 2
        })
      ]
    });

    render(<CartSheet open onOpenChange={vi.fn()} />);

    expect(
      screen.getByRole('button', { name: 'Confirmar venda' })
    ).toBeDisabled();
  });

  it('should keep "Confirmar venda" disabled until a payment method is chosen', () => {
    useCartStore.setState({
      items: [
        cartItemFactory.build({
          productId: 'p1',
          variantId: undefined,
          quantity: 1
        })
      ]
    });
    mockUsePdvProductsQuery.mockReturnValue({
      data: [
        pdvProductFactory.build({
          productId: 'p1',
          variantId: undefined,
          stock: 5
        })
      ]
    });

    render(<CartSheet open onOpenChange={vi.fn()} />);

    expect(
      screen.getByRole('button', { name: 'Confirmar venda' })
    ).toBeDisabled();
  });

  it('should enable "Confirmar venda" once every item is within stock and a payment method is chosen', async () => {
    useCartStore.setState({
      items: [
        cartItemFactory.build({
          productId: 'p1',
          variantId: undefined,
          quantity: 1
        })
      ]
    });
    mockUsePdvProductsQuery.mockReturnValue({
      data: [
        pdvProductFactory.build({
          productId: 'p1',
          variantId: undefined,
          stock: 5
        })
      ]
    });

    render(<CartSheet open onOpenChange={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: 'Cartão' }));

    expect(
      screen.getByRole('button', { name: 'Confirmar venda' })
    ).toBeEnabled();
  });

  it('should show the loading label while the sale is being registered', () => {
    useCartStore.setState({ items: [cartItemFactory.build()] });
    mockUseConfirmPosSaleMutation.mockReturnValue({
      mutate: mockConfirmSale,
      isPending: true
    });

    render(<CartSheet open onOpenChange={vi.fn()} />);

    expect(screen.getByRole('button', { name: 'Registrando…' })).toBeDisabled();
  });

  it('should call confirmSale with the catalogId and mapped items on confirm', async () => {
    useCartStore.setState({
      items: [
        cartItemFactory.build({
          productId: 'p1',
          variantId: undefined,
          unitPrice: 10000,
          discount: 1000,
          quantity: 2
        })
      ]
    });
    mockUsePdvProductsQuery.mockReturnValue({
      data: [
        pdvProductFactory.build({
          productId: 'p1',
          variantId: undefined,
          stock: 5
        })
      ]
    });

    render(<CartSheet open onOpenChange={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: 'Cartão' }));
    await user.click(screen.getByRole('button', { name: 'Confirmar venda' }));

    expect(mockConfirmSale).toHaveBeenCalledWith(
      {
        catalogId: 'cat-1',
        customer: null,
        items: [
          {
            productId: 'p1',
            variantId: undefined,
            quantity: 2,
            referencePrice: 10000,
            discountAmount: 1000,
            availableStock: 5
          }
        ],
        paymentMethod: 'card',
        amountPaid: undefined,
        proofFile: undefined
      },
      expect.objectContaining({ onSuccess: expect.any(Function) })
    );
  });

  it('should show the sale receipt once the mutation succeeds, and "Nova venda" clears it and closes the sheet', async () => {
    useCartStore.setState({
      items: [
        cartItemFactory.build({
          productId: 'p1',
          variantId: undefined,
          unitPrice: 10000,
          discount: 0,
          quantity: 1
        })
      ]
    });
    mockUsePdvProductsQuery.mockReturnValue({
      data: [
        pdvProductFactory.build({
          productId: 'p1',
          variantId: undefined,
          stock: 5
        })
      ]
    });
    const onOpenChange = vi.fn();

    render(<CartSheet open onOpenChange={onOpenChange} />);

    await user.click(screen.getByRole('button', { name: 'Cartão' }));
    await user.click(screen.getByRole('button', { name: 'Confirmar venda' }));

    const [, { onSuccess }] = mockConfirmSale.mock.calls[0];
    act(() => {
      onSuccess('order-1');
      // Reflete o que useConfirmPosSaleMutation faz de verdade no onSuccess
      // do hook (limpa o carrinho) antes do onSuccess passado ao mutate.
      useCartStore.setState({ items: [] });
    });

    expect(screen.getByText('Venda concluída')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Nova venda' }));

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
