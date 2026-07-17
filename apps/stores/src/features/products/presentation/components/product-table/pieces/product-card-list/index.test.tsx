import { MemoryRouter } from 'react-router';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { productWithVariantsFactory } from '../../../../../tests/factories/product.factory';

vi.mock('@/features/permissions', () => ({
  ActionButton: ({
    children,
    ...props
  }: React.ComponentProps<'button'> & { action: string }) => (
    <button {...props}>{children}</button>
  )
}));

vi.mock('./pieces/product-card', () => ({
  ProductCard: ({ product }: { product: { id: string; name: string } }) => (
    <div data-testid={`product-card-${product.id}`}>{product.name}</div>
  )
}));

beforeEach(() => {
  window.HTMLElement.prototype.hasPointerCapture = vi.fn();
  window.HTMLElement.prototype.releasePointerCapture = vi.fn();
  window.HTMLElement.prototype.scrollIntoView = vi.fn();
});

import { ProductCardList } from '.';

describe('ProductCardList', () => {
  const products = [
    productWithVariantsFactory.build({
      id: 'p-1',
      hasVariants: false,
      variants: [],
      name: 'Camiseta Azul',
      sku: 'SKU-1',
      isActive: true,
      categories: [{ id: 'cat-1', name: 'Roupas' }]
    }),
    productWithVariantsFactory.build({
      id: 'p-2',
      hasVariants: false,
      variants: [],
      name: 'Calça Verde',
      sku: 'SKU-2',
      isActive: true,
      categories: [{ id: 'cat-2', name: 'Calças' }]
    })
  ];

  const categoryOptions = [
    { value: 'all', label: 'Todas as categorias' },
    { value: 'cat-1', label: 'Roupas' },
    { value: 'cat-2', label: 'Calças' }
  ];

  it('should render a card for each product', () => {
    render(
      <MemoryRouter>
        <ProductCardList
          products={products}
          categoryOptions={categoryOptions}
        />
      </MemoryRouter>
    );

    expect(screen.getByTestId('product-card-p-1')).toBeInTheDocument();
    expect(screen.getByTestId('product-card-p-2')).toBeInTheDocument();
  });

  it('should filter products by search term (name or sku)', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <ProductCardList
          products={products}
          categoryOptions={categoryOptions}
        />
      </MemoryRouter>
    );

    await user.type(
      screen.getByPlaceholderText('Buscar por nome ou SKU'),
      'Azul'
    );

    expect(screen.getByTestId('product-card-p-1')).toBeInTheDocument();
    expect(screen.queryByTestId('product-card-p-2')).not.toBeInTheDocument();
  });

  it('should show the empty message when the search does not match anything', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <ProductCardList
          products={products}
          categoryOptions={categoryOptions}
        />
      </MemoryRouter>
    );

    await user.type(
      screen.getByPlaceholderText('Buscar por nome ou SKU'),
      'Inexistente'
    );

    expect(
      screen.getByText(/Nada encontrado para 'Inexistente'\./)
    ).toBeInTheDocument();
  });

  it('should render the create and import CTAs', () => {
    render(
      <MemoryRouter>
        <ProductCardList
          products={products}
          categoryOptions={categoryOptions}
        />
      </MemoryRouter>
    );

    expect(screen.getByLabelText('Cadastrar produto')).toBeInTheDocument();
    expect(screen.getByLabelText('Importar produtos')).toBeInTheDocument();
  });
});
