import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { catalogItemFactory } from '../../../tests/factories/catalog-item.factory';
import type { AvailableProduct } from '../../hooks/use-queries';

import { CurationProductGroup } from './index';

const { mockUseIsMobile, mockCan, mockRemoveProduct } = vi.hoisted(() => ({
  mockUseIsMobile: vi.fn(),
  mockCan: vi.fn(),
  mockRemoveProduct: vi.fn()
}));

vi.mock('@/shared/hooks/use-is-mobile', () => ({
  useIsMobile: mockUseIsMobile
}));

vi.mock('@/features/permissions', () => ({
  usePermission: () => ({ can: mockCan })
}));

vi.mock('@/features/products', () => ({
  VariantOptionBadge: ({ option }: { option: { value: string } }) => (
    <span>{option.value}</span>
  )
}));

vi.mock('../../hooks/use-mutations', () => ({
  useRemoveCatalogProductMutation: () => ({
    mutate: mockRemoveProduct,
    isPending: false
  })
}));

vi.mock('../actions/configure-prices', () => ({
  ConfigurePricesDialog: () => null
}));

const product: AvailableProduct = {
  id: 'p1',
  name: 'Cadeira Ergonômica',
  sku: 'CAD-001',
  imageUrl: undefined,
  alreadyAdded: true,
  hasVariants: false,
  variants: [],
  costPrice: undefined
};

describe('CurationProductGroup', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseIsMobile.mockReturnValue(false);
    mockCan.mockReturnValue(true);
  });

  it('should show the inline price on desktop, without stacked labels', () => {
    const items = [
      catalogItemFactory.build({ productId: 'p1', price: 8990, product })
    ];

    render(
      <CurationProductGroup items={items} product={product} catalogId="cat-1" />
    );

    expect(screen.getByText(/89,90/)).toBeInTheDocument();
    expect(screen.queryByText('Preço')).not.toBeInTheDocument();
  });

  it('should hide edit/remove actions for sales (readonly)', () => {
    mockCan.mockReturnValue(false);
    const items = [
      catalogItemFactory.build({ productId: 'p1', price: 8990, product })
    ];

    render(
      <CurationProductGroup items={items} product={product} catalogId="cat-1" />
    );

    expect(screen.queryByTitle('Editar preços')).not.toBeInTheDocument();
    expect(screen.queryByTitle('Remover produto')).not.toBeInTheDocument();
  });

  describe('mobile (~390px)', () => {
    beforeEach(() => {
      mockUseIsMobile.mockReturnValue(true);
    });

    it('should stack sale and original prices below the header', () => {
      const items = [
        catalogItemFactory.build({
          productId: 'p1',
          price: 8990,
          originalPrice: 12990,
          product
        })
      ];

      render(
        <CurationProductGroup
          items={items}
          product={product}
          catalogId="cat-1"
        />
      );

      expect(screen.getByText('Preço')).toBeInTheDocument();
      expect(screen.getByText(/89,90/)).toBeInTheDocument();
      expect(screen.getByText('Original')).toBeInTheDocument();
      expect(screen.getByText(/129,90/)).toBeInTheDocument();
    });

    it('should omit the original price row when there is no promotion', () => {
      const items = [
        catalogItemFactory.build({
          productId: 'p1',
          price: 8990,
          originalPrice: undefined,
          product
        })
      ];

      render(
        <CurationProductGroup
          items={items}
          product={product}
          catalogId="cat-1"
        />
      );

      expect(screen.getByText('Preço')).toBeInTheDocument();
      expect(screen.queryByText('Original')).not.toBeInTheDocument();
    });

    it('should stack variant rows vertically', async () => {
      const variantProduct: AvailableProduct = {
        ...product,
        hasVariants: true,
        variants: [
          { id: 'v1', sku: 'CAD-001-A', options: [], imageUrl: undefined },
          { id: 'v2', sku: 'CAD-001-B', options: [], imageUrl: undefined }
        ]
      };
      const items = [
        catalogItemFactory.build({
          productId: 'p1',
          variantId: 'v1',
          price: 8990,
          product,
          variant: { id: 'v1', sku: 'CAD-001-A', options: [] }
        }),
        catalogItemFactory.build({
          productId: 'p1',
          variantId: 'v2',
          price: 9990,
          product,
          variant: { id: 'v2', sku: 'CAD-001-B', options: [] }
        })
      ];

      render(
        <CurationProductGroup
          items={items}
          product={variantProduct}
          catalogId="cat-1"
        />
      );

      await user.click(screen.getByText('Cadeira Ergonômica'));

      const rows = screen.getAllByTestId('variant-row');
      expect(rows).toHaveLength(2);
      rows.forEach((row) => expect(row.className).toContain('flex-col'));
    });

    it('should keep variant rows horizontal on desktop', async () => {
      mockUseIsMobile.mockReturnValue(false);

      const variantProduct: AvailableProduct = {
        ...product,
        hasVariants: true,
        variants: [
          { id: 'v1', sku: 'CAD-001-A', options: [], imageUrl: undefined }
        ]
      };
      const items = [
        catalogItemFactory.build({
          productId: 'p1',
          variantId: 'v1',
          price: 8990,
          product,
          variant: { id: 'v1', sku: 'CAD-001-A', options: [] }
        })
      ];

      render(
        <CurationProductGroup
          items={items}
          product={variantProduct}
          catalogId="cat-1"
        />
      );

      await user.click(screen.getByText('Cadeira Ergonômica'));

      const [row] = screen.getAllByTestId('variant-row');
      expect(row.className).not.toContain('flex-col');
    });
  });
});
