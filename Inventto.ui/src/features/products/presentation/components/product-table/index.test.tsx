import { BrowserRouter } from 'react-router';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  productAttributeFactory,
  productFactory,
  productVariantFactory,
  productWithVariantsFactory
} from '../../../tests/factories/product.factory';
import { useProductsQuery } from '../../hooks/use-queries';

import { ProductListTable } from './index';

vi.mock('../../hooks/use-queries');

vi.mock('@/features/users', () => ({
  useUser: vi.fn().mockReturnValue({
    currentOrganization: { id: 'org-1' },
    role: 'manager'
  })
}));

const mockProducts = [
  productFactory.build({
    id: 'prod-1',
    organizationId: 'org-1',
    name: 'Camiseta Básica',
    sku: 'TSHIRT-001',
    description: '100% Algodão',
    stock: 50,
    minimumStock: 10,
    isActive: true,
    categories: [{ id: 'cat-1', name: 'Roupas' }],
    attributes: [],
    allImages: [],
    variants: []
  }),
  productWithVariantsFactory.build({
    id: 'prod-2',
    organizationId: 'org-1',
    name: 'Tênis Esportivo',
    sku: 'SNEAKER-X',
    stock: 20,
    minimumStock: 5,
    isActive: true,
    categories: [{ id: 'cat-2', name: 'Calçados' }],
    attributes: [
      productAttributeFactory.build({
        id: 'a1',
        name: 'Tamanho',
        slug: 'tamanho',
        type: 'text',
        values: ['40', '41']
      })
    ],
    variants: [
      productVariantFactory.build({
        id: 'var-1',
        sku: 'SNEAKER-X-40',
        stock: 10,
        minimumStock: 2,
        isActive: true,
        options: [{ name: 'Tamanho', value: '40' }],
        images: []
      }),
      productVariantFactory.build({
        id: 'var-2',
        sku: 'SNEAKER-X-41',
        stock: 10,
        minimumStock: 2,
        isActive: true,
        options: [{ name: 'Tamanho', value: '41' }],
        images: []
      })
    ],
    allImages: []
  })
];

const renderWithProviders = (ui: ReactNode) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe('ProductListTable (Integration)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the table with products returned by the query', () => {
    vi.mocked(useProductsQuery).mockReturnValue({
      data: mockProducts,
      isLoading: false,
      isError: false,
      error: null
    } as never);

    renderWithProviders(<ProductListTable />);

    expect(screen.getByText('Camiseta Básica')).toBeInTheDocument();
    expect(screen.getByText('Tênis Esportivo')).toBeInTheDocument();
    expect(screen.getByText('TSHIRT-001')).toBeInTheDocument();
    expect(screen.getByText('SNEAKER-X')).toBeInTheDocument();
    expect(screen.getByText('Roupas')).toBeInTheDocument();
    expect(screen.getByText('Calçados')).toBeInTheDocument();
  });

  it('should display the onboarding empty-state when there are no products', () => {
    vi.mocked(useProductsQuery).mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      error: null
    } as never);

    renderWithProviders(<ProductListTable />);

    expect(
      screen.getByText('Comece cadastrando seu primeiro produto.')
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /Cadastrar produto/i })
    ).toBeInTheDocument();
  });

  it('should handle loading state gracefully', () => {
    vi.mocked(useProductsQuery).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null
    } as never);

    renderWithProviders(<ProductListTable />);

    expect(screen.queryByText('Camiseta Básica')).not.toBeInTheDocument();
  });

  it('should render specific columns correctly', () => {
    vi.mocked(useProductsQuery).mockReturnValue({
      data: mockProducts,
      isLoading: false,
      isError: false
    } as never);

    renderWithProviders(<ProductListTable />);

    expect(
      screen.getByRole('columnheader', { name: /Produto/i })
    ).toBeInTheDocument();

    expect(
      screen.getByRole('columnheader', { name: /Categorias/i })
    ).toBeInTheDocument();

    expect(
      screen.getByRole('columnheader', { name: /Estoque/i })
    ).toBeInTheDocument();

    expect(
      screen.getByRole('columnheader', { name: /Status/i })
    ).toBeInTheDocument();
  });

  it('should expand row and show variants when expand button is clicked', async () => {
    const user = userEvent.setup();

    vi.mocked(useProductsQuery).mockReturnValue({
      data: mockProducts,
      isLoading: false,
      isError: false,
      error: null
    } as never);

    renderWithProviders(<ProductListTable />);

    const row = screen.getByRole('row', { name: /Tênis Esportivo/i });

    const expandButton = within(row).getByRole('button', {
      name: /Expandir variações/i
    });

    await user.click(expandButton);

    expect(screen.getByText('SNEAKER-X-40')).toBeInTheDocument();
    expect(screen.getByText('SNEAKER-X-41')).toBeInTheDocument();
  });

  it('should show the "Nada encontrado" message when the search has no match', async () => {
    const user = userEvent.setup();

    vi.mocked(useProductsQuery).mockReturnValue({
      data: mockProducts,
      isLoading: false,
      isError: false,
      error: null
    } as never);

    renderWithProviders(<ProductListTable />);

    const search = screen.getByPlaceholderText('Buscar por nome ou SKU');

    await user.type(search, 'guarda-chuva');

    expect(
      await screen.findByText("Nada encontrado para 'guarda-chuva'.")
    ).toBeInTheDocument();
  });

  it('should render an inactive product with the "Inativo" badge', () => {
    vi.mocked(useProductsQuery).mockReturnValue({
      data: [{ ...mockProducts[0], isActive: false }],
      isLoading: false,
      isError: false,
      error: null
    } as never);

    renderWithProviders(<ProductListTable />);

    expect(screen.getByText('Inativo')).toBeInTheDocument();
  });
});
