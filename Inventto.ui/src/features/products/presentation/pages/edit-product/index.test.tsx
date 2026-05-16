import { BrowserRouter, useParams } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  useCategoriesQuery,
  useCategoryAddMutation as useCreateCategoryMutation
} from '@/features/categories';

import {
  useCreateProductMutation,
  useUpdateProductMutation
} from '../../hooks/use-mutations';
import { useProductByIDQuery } from '../../hooks/use-queries';

import { EditProductPage } from './index';

vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>();
  return {
    ...actual,
    useParams: vi.fn()
  };
});

vi.mock('../../hooks/use-queries');
vi.mock('../../hooks/use-mutations');
vi.mock('@/features/categories', async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>();
  return {
    ...actual,
    useCategoriesQuery: vi.fn(),
    useCategoryAddMutation: vi.fn()
  };
});
vi.mock('@/app/services/image-upload');
vi.mock('@/features/users', () => ({
  useUser: () => ({ currentOrganization: { id: 'org-1' }, role: 'owner' })
}));

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver = ResizeObserverMock;
window.HTMLElement.prototype.scrollIntoView = vi.fn();
window.PointerEvent = MouseEvent as typeof PointerEvent;

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } }
});

const renderComponent = () => {
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <EditProductPage />
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('EditProductPage (Integration)', () => {
  const mockProduct = {
    id: 'p123',
    name: 'Caneta Luxo',
    sku: 'PEN-LUX-01',
    description: 'Caneta esferográfica dourada',
    stock: 100,
    minimumStock: 10,
    hasVariants: false,
    category: { id: 'cat1', name: 'Escritório' },
    attributes: [],
    variants: [],
    allImages: []
  };

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useProductByIDQuery).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null
    } as never);

    vi.mocked(useCategoriesQuery).mockReturnValue({
      data: [{ id: 'cat1', name: 'Escritório' }],
      isLoading: false,
      isError: false
    } as never);

    vi.mocked(useUpdateProductMutation).mockReturnValue({
      mutateAsync: vi.fn()
    } as never);

    vi.mocked(useCreateProductMutation).mockReturnValue({
      mutateAsync: vi.fn()
    } as never);

    vi.mocked(useCreateCategoryMutation).mockReturnValue({
      mutateAsync: vi.fn()
    } as never);
  });

  it('should render loading state initially or null if ID is missing', () => {
    vi.mocked(useParams).mockReturnValue({ productId: undefined });

    const { container } = renderComponent();

    expect(container.firstChild).toBeNull();
  });

  it('should populate the real form with product data fetched by ID', async () => {
    vi.mocked(useParams).mockReturnValue({ productId: 'p123' });

    vi.mocked(useProductByIDQuery).mockReturnValue({
      data: mockProduct,
      isLoading: false,
      isError: false
    } as never);

    renderComponent();

    expect(
      screen.getByRole('heading', { name: /Caneta Luxo/i })
    ).toBeInTheDocument();

    expect(screen.getByText('Edite os dados do produto.')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByDisplayValue('Caneta Luxo')).toBeInTheDocument();
      expect(screen.getByDisplayValue('PEN-LUX-01')).toBeInTheDocument();
    });
  });

  it('should display graceful handling (empty state) when product is not found', () => {
    vi.mocked(useParams).mockReturnValue({ productId: 'p999' });

    vi.mocked(useProductByIDQuery).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true
    } as never);

    const { container } = renderComponent();

    expect(container.firstChild).toBeNull();
  });
});
