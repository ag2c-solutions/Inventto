import { MemoryRouter } from 'react-router';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import {
  productAttributeFactory,
  productVariantFactory,
  productWithVariantsFactory
} from '../../../tests/factories/product.factory';

const { mockUseProductByIDQuery } = vi.hoisted(() => ({
  mockUseProductByIDQuery: vi.fn()
}));

vi.mock('../../hooks/use-queries', () => ({
  useProductByIDQuery: (id: string) => mockUseProductByIDQuery(id)
}));

vi.mock('@/features/permissions', () => ({
  VisibleTo: ({ children }: { children: React.ReactNode }) => <>{children}</>
}));

vi.mock('../actions/change-product-status', () => ({
  ChangeProductStatusAction: ({ productName }: { productName: string }) => (
    <div data-testid="change-status-action">{productName}</div>
  )
}));

vi.mock('../actions/edit', () => ({
  EditProductAction: () => <div data-testid="edit-action" />
}));

vi.mock('../actions/register-movement', () => ({
  RegisterProductMovementAction: () => (
    <div data-testid="register-movement-action" />
  )
}));

vi.mock('../grade-summary', () => ({
  ProductGradeSummary: () => <div data-testid="grade-summary" />
}));

vi.mock('../inventory-card', () => ({
  ProductInventoryCard: ({ stock }: { stock: number }) => (
    <div data-testid="inventory-card">stock:{stock}</div>
  )
}));

vi.mock('./basic-infos-card', () => ({
  ProductBasicInfosCard: ({ name }: { name: string }) => (
    <div data-testid="basic-infos">{name}</div>
  )
}));

vi.mock('./image-carousel', () => ({
  ProductImageCarousel: () => <div data-testid="image-carousel" />
}));

vi.mock('./options-select', () => ({
  ProductOptionsSelect: ({
    onSelectOption
  }: {
    onSelectOption: (attributeName: string, value: string) => void;
  }) => (
    <button
      data-testid="select-option"
      onClick={() => onSelectOption('Cor', 'Azul')}
    >
      select
    </button>
  )
}));

import { ProductDetailsCard } from '.';

describe('ProductDetailsCard', () => {
  it('should render the loading skeleton while the query is pending', () => {
    mockUseProductByIDQuery.mockReturnValue({
      data: undefined,
      isLoading: true
    });

    render(<ProductDetailsCard productId="prod-1" />);

    expect(screen.queryByTestId('basic-infos')).not.toBeInTheDocument();
  });

  it('should render the not-found state when there is no product and loading finished', () => {
    mockUseProductByIDQuery.mockReturnValue({
      data: undefined,
      isLoading: false
    });

    render(
      <MemoryRouter>
        <ProductDetailsCard productId="missing" />
      </MemoryRouter>
    );

    expect(screen.getByText('Produto não encontrado')).toBeInTheDocument();
  });

  it('should render the product basic info, inventory and images for a simple product', () => {
    const product = productWithVariantsFactory.build({
      hasVariants: false,
      variants: [],
      name: 'Camiseta Azul',
      stock: 20
    });

    mockUseProductByIDQuery.mockReturnValue({
      data: product,
      isLoading: false
    });

    render(<ProductDetailsCard productId={product.id} />);

    expect(screen.getByTestId('basic-infos')).toHaveTextContent(
      'Camiseta Azul'
    );
    expect(screen.getByTestId('inventory-card')).toHaveTextContent('stock:20');
    expect(screen.queryByTestId('grade-summary')).not.toBeInTheDocument();
    expect(screen.queryByTestId('select-option')).not.toBeInTheDocument();
  });

  it('should render options select and grade summary for a product with variants', () => {
    const product = productWithVariantsFactory.build({
      attributes: [productAttributeFactory.build({ name: 'Cor' })],
      variants: [
        productVariantFactory.build({
          options: [{ name: 'Cor', value: 'Azul' }],
          isActive: true
        })
      ]
    });

    mockUseProductByIDQuery.mockReturnValue({
      data: product,
      isLoading: false
    });

    render(<ProductDetailsCard productId={product.id} />);

    expect(screen.getByTestId('grade-summary')).toBeInTheDocument();
    expect(screen.getByTestId('select-option')).toBeInTheDocument();
  });

  it('should update the displayed stock when a variant option is selected', async () => {
    const user = userEvent.setup();
    const variant = productVariantFactory.build({
      stock: 77,
      options: [{ name: 'Cor', value: 'Azul' }],
      isActive: true
    });
    const otherVariant = productVariantFactory.build({
      stock: 5,
      options: [{ name: 'Cor', value: 'Verde' }],
      isActive: true
    });
    const product = productWithVariantsFactory.build({
      attributes: [productAttributeFactory.build({ name: 'Cor' })],
      variants: [otherVariant, variant]
    });

    mockUseProductByIDQuery.mockReturnValue({
      data: product,
      isLoading: false
    });

    render(<ProductDetailsCard productId={product.id} />);

    await user.click(screen.getByTestId('select-option'));

    expect(screen.getByTestId('inventory-card')).toHaveTextContent('stock:77');
  });
});
