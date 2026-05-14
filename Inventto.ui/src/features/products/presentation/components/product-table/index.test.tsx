import { BrowserRouter } from 'react-router';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { IProduct } from '../../../domain/entities';
import { useProductsQuery } from '../../hooks/use-query';

import { ProductListTable } from './index';

vi.mock('../../hooks/use-query');

vi.mock('@/features/users', () => ({
  useUser: vi.fn().mockReturnValue({
    currentOrganization: { id: 'org-1' },
    role: 'manager'
  })
}));

const mockProducts: IProduct[] = [
  {
    id: 'prod-1',
    organizationId: 'org-1',
    name: 'Camiseta Básica',
    sku: 'TSHIRT-001',
    description: '100% Algodão',
    stock: 50,
    minimumStock: 10,
    isActive: true,
    hasVariants: false,
    categories: [{ id: 'cat-1', name: 'Roupas' }],
    attributes: [],
    allImages: [],
    variants: []
  },
  {
    id: 'prod-2',
    organizationId: 'org-1',
    name: 'Tênis Esportivo',
    sku: 'SNEAKER-X',
    stock: 20,
    minimumStock: 5,
    isActive: true,
    hasVariants: true,
    categories: [{ id: 'cat-2', name: 'Calçados' }],
    attributes: [
      {
        id: 'a1',
        name: 'Tamanho',
        slug: 'tamanho',
        type: 'text',
        values: ['40', '41']
      }
    ],
    variants: [
      {
        id: 'var-1',
        sku: 'SNEAKER-X-40',
        stock: 10,
        minimumStock: 2,
        isActive: true,
        options: [{ name: 'Tamanho', value: '40' }],
        images: []
      },
      {
        id: 'var-2',
        sku: 'SNEAKER-X-41',
        stock: 10,
        minimumStock: 2,
        isActive: true,
        options: [{ name: 'Tamanho', value: '41' }],
        images: []
      }
    ],
    allImages: []
  }
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

  it('should display "Nenhum produto foi encontrado." message when the list is empty', () => {
    vi.mocked(useProductsQuery).mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      error: null
    } as never);

    renderWithProviders(<ProductListTable />);

    expect(
      screen.getByText('Nenhum produto foi encontrado.')
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
      screen.getByRole('columnheader', { name: /Nome/i })
    ).toBeInTheDocument();

    expect(
      screen.getByRole('columnheader', { name: /Categoria/i })
    ).toBeInTheDocument();

    expect(
      screen.getByRole('columnheader', { name: /Estoque/i })
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

    const expandButton = within(row).getByRole('button', { name: '+' });

    await user.click(expandButton);

    expect(screen.getByText('SNEAKER-X-40')).toBeInTheDocument();
    expect(screen.getByText('SNEAKER-X-41')).toBeInTheDocument();
  });
});
