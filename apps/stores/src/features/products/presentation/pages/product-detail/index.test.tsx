import { BrowserRouter, useParams } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useUser } from '@/features/users';

import {
  productAttributeFactory,
  productImageFactory,
  productVariantFactory,
  productWithVariantsFactory
} from '../../../tests/factories/product.factory';
import { useProductByIDQuery } from '../../hooks/use-queries';

import { ProductDetailsPage } from './index';

vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>();
  return {
    ...actual,
    useParams: vi.fn()
  };
});

vi.mock('../../hooks/use-queries');

vi.mock('../../hooks/use-mutations', () => ({
  useChangeProductStatusMutation: vi.fn().mockReturnValue({
    mutateAsync: vi.fn(),
    isPending: false
  })
}));

vi.mock('@/features/users', () => ({
  useUser: vi.fn().mockReturnValue({ role: 'owner' })
}));

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver = ResizeObserverMock;
window.PointerEvent = MouseEvent as typeof PointerEvent;
window.HTMLElement.prototype.scrollIntoView = vi.fn();
window.HTMLElement.prototype.hasPointerCapture = vi.fn();
window.HTMLElement.prototype.releasePointerCapture = vi.fn();

vi.mock('@/shared/components/ui/carousel', () => ({
  Carousel: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="real-carousel">{children}</div>
  ),
  CarouselContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  CarouselItem: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  CarouselPrevious: () => <button>Prev</button>,
  CarouselNext: () => <button>Next</button>
}));

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } }
});

const renderComponent = () => {
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ProductDetailsPage />
      </BrowserRouter>
    </QueryClientProvider>
  );
};

const buildProductWithVariants = () => {
  const imgBlue = productImageFactory.build({
    id: 'img-blue',
    url: 'url-blue',
    name: 'img-blue',
    isPrimary: false
  });
  const imgRed = productImageFactory.build({
    id: 'img-red',
    url: 'url-red',
    name: 'img-red',
    isPrimary: false
  });

  return productWithVariantsFactory.build({
    id: 'p1',
    name: 'Tênis Runner',
    description: 'Tênis de corrida',
    sku: 'RUN-BASE',
    categories: [{ id: 'cat-1', name: 'Calçados' }],
    allImages: [imgBlue, imgRed],
    attributes: [
      productAttributeFactory.build({
        id: 'attr-1',
        name: 'Cor',
        slug: 'cor',
        type: 'text',
        values: ['Azul', 'Vermelho']
      })
    ],
    variants: [
      productVariantFactory.build({
        id: 'v1',
        sku: 'RUN-BLUE',
        stock: 50,
        minimumStock: 5,
        options: [{ name: 'Cor', value: 'Azul' }],
        images: [{ id: 'img-blue', isPrimary: true }]
      }),
      productVariantFactory.build({
        id: 'v2',
        sku: 'RUN-RED',
        stock: 20,
        minimumStock: 2,
        options: [{ name: 'Cor', value: 'Vermelho' }],
        images: [{ id: 'img-red', isPrimary: true }]
      })
    ]
  });
};

describe('ProductDetailsPage (Integration)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useParams).mockReturnValue({ productId: 'p1' });
  });

  it('should render a loading skeleton while fetching, not the 404 state', () => {
    vi.mocked(useProductByIDQuery).mockReturnValue({
      data: undefined,
      isLoading: true
    } as never);

    renderComponent();

    expect(
      screen.queryByText('Produto não encontrado')
    ).not.toBeInTheDocument();
  });

  it('should render a friendly 404 when the product is not found', () => {
    vi.mocked(useProductByIDQuery).mockReturnValue({
      data: undefined,
      isLoading: false
    } as never);

    renderComponent();

    expect(screen.getByText('Produto não encontrado')).toBeInTheDocument();
  });

  it('should use empty string fallback when productId is undefined', () => {
    vi.mocked(useParams).mockReturnValue({ productId: undefined });
    vi.mocked(useProductByIDQuery).mockReturnValue({
      data: undefined,
      isLoading: false
    } as never);

    renderComponent();

    expect(useProductByIDQuery).toHaveBeenCalledWith('');
    expect(screen.getByText('Produto não encontrado')).toBeInTheDocument();
  });

  it('should render simple product details correctly (no variants)', () => {
    const productSimple = productWithVariantsFactory.build({
      id: 'p-simple',
      name: 'Camiseta Lisa',
      sku: 'TEE-SMP',
      hasVariants: false,
      categories: [{ id: 'cat-1', name: 'Roupas' }],
      allImages: [
        productImageFactory.build({
          id: 'img-1',
          url: 'url-1',
          name: 'img-1',
          isPrimary: true
        })
      ],
      attributes: [],
      variants: [],
      stock: 100,
      minimumStock: 10
    });

    vi.mocked(useProductByIDQuery).mockReturnValue({
      data: productSimple,
      isLoading: false
    } as never);

    renderComponent();

    expect(
      screen.getByRole('heading', { name: 'Camiseta Lisa' })
    ).toBeInTheDocument();

    expect(screen.getByText(/TEE-SMP/)).toBeInTheDocument();
    expect(screen.getByTestId('real-carousel')).toBeInTheDocument();
    expect(screen.getByText('100 un.')).toBeInTheDocument();
  });

  it('should render product details and default to first variant', () => {
    vi.mocked(useProductByIDQuery).mockReturnValue({
      data: buildProductWithVariants(),
      isLoading: false
    } as never);

    renderComponent();

    expect(
      screen.getByRole('heading', { name: 'Tênis Runner' })
    ).toBeInTheDocument();

    expect(screen.getByText(/RUN-BLUE/)).toBeInTheDocument();
    expect(screen.getByText('50 un.')).toBeInTheDocument();
  });

  it('should switch variant data when user selects a different option', async () => {
    vi.mocked(useProductByIDQuery).mockReturnValue({
      data: buildProductWithVariants(),
      isLoading: false
    } as never);

    const user = userEvent.setup();

    renderComponent();

    expect(screen.getByText(/RUN-BLUE/)).toBeInTheDocument();

    const redOption = screen.getByRole('button', { name: 'Vermelho' });

    await user.click(redOption);

    expect(screen.getByText(/RUN-RED/)).toBeInTheDocument();
    expect(screen.queryByText(/RUN-BLUE/)).not.toBeInTheDocument();
    expect(screen.getByText('20 un.')).toBeInTheDocument();
  });

  it('should handle variant images correctly even if no primary image is defined', () => {
    const productNoPrimary = productWithVariantsFactory.build({
      ...buildProductWithVariants(),
      allImages: [
        productImageFactory.build({
          id: 'img-np',
          url: 'url-np',
          name: 'img-np',
          isPrimary: false
        })
      ],
      variants: [
        productVariantFactory.build({
          id: 'v-no-primary',
          sku: 'RUN-NP',
          stock: 10,
          minimumStock: 1,
          options: [{ name: 'Cor', value: 'Verde' }],
          images: [{ id: 'img-np', isPrimary: false }]
        })
      ],
      attributes: [
        productAttributeFactory.build({
          id: 'attr-1',
          name: 'Cor',
          slug: 'cor',
          type: 'text',
          values: ['Verde']
        })
      ]
    });

    vi.mocked(useProductByIDQuery).mockReturnValue({
      data: productNoPrimary,
      isLoading: false
    } as never);

    renderComponent();

    expect(screen.getByText(/RUN-NP/)).toBeInTheDocument();
    expect(screen.getByTestId('real-carousel')).toBeInTheDocument();
  });

  it('should correctly identify primary image when it is NOT the first one in the list', () => {
    const productMultiImages = productWithVariantsFactory.build({
      ...buildProductWithVariants(),
      allImages: [
        productImageFactory.build({
          id: 'img-1',
          url: 'url-1',
          name: 'img-1',
          isPrimary: false
        }),
        productImageFactory.build({
          id: 'img-2',
          url: 'url-2',
          name: 'img-2',
          isPrimary: true
        })
      ],
      variants: [
        productVariantFactory.build({
          id: 'v-multi',
          sku: 'RUN-MULTI',
          stock: 10,
          minimumStock: 1,
          options: [{ name: 'Cor', value: 'Roxo' }],
          images: [
            { id: 'img-1', isPrimary: false },
            { id: 'img-2', isPrimary: true }
          ]
        })
      ],
      attributes: [
        productAttributeFactory.build({
          id: 'attr-1',
          name: 'Cor',
          slug: 'cor',
          type: 'text',
          values: ['Roxo']
        })
      ]
    });

    vi.mocked(useProductByIDQuery).mockReturnValue({
      data: productMultiImages,
      isLoading: false
    } as never);

    renderComponent();

    expect(screen.getByText(/RUN-MULTI/)).toBeInTheDocument();
    expect(screen.getByTestId('real-carousel')).toBeInTheDocument();
  });

  it('should show the management actions menu and status badge for owner/manager', async () => {
    vi.mocked(useProductByIDQuery).mockReturnValue({
      data: { ...buildProductWithVariants(), isActive: true },
      isLoading: false
    } as never);

    const user = userEvent.setup();

    renderComponent();

    expect(screen.getByText('Ativo')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Ações do produto' }));

    expect(
      screen.getByRole('menuitem', { name: /Editar/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('menuitem', { name: /Registrar movimentação/ })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Inativar/i })
    ).toBeInTheDocument();
  });

  it('should hide the "Inativar" action for an already inactive product', async () => {
    vi.mocked(useProductByIDQuery).mockReturnValue({
      data: { ...buildProductWithVariants(), isActive: false },
      isLoading: false
    } as never);

    const user = userEvent.setup();

    renderComponent();

    expect(screen.getByText('Inativo')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Ações do produto' }));

    expect(
      screen.queryByRole('menuitem', { name: /Inativar/ })
    ).not.toBeInTheDocument();
  });

  it('should hide edit/inactivate actions for sales (no product:edit or product:delete permission)', async () => {
    vi.mocked(useUser).mockReturnValue({ role: 'sales' } as never);
    vi.mocked(useProductByIDQuery).mockReturnValue({
      data: { ...buildProductWithVariants(), isActive: true },
      isLoading: false
    } as never);

    const user = userEvent.setup();

    renderComponent();

    await user.click(screen.getByRole('button', { name: 'Ações do produto' }));

    expect(
      screen.queryByRole('menuitem', { name: /Editar/i })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /Inativar/i })
    ).not.toBeInTheDocument();
  });

  it('should handle variant with empty images array gracefully', () => {
    const productEmptyImages = productWithVariantsFactory.build({
      ...buildProductWithVariants(),
      variants: [
        productVariantFactory.build({
          id: 'v-empty',
          sku: 'RUN-EMPTY',
          stock: 5,
          minimumStock: 1,
          options: [{ name: 'Cor', value: 'Cinza' }],
          images: []
        })
      ],
      attributes: [
        productAttributeFactory.build({
          id: 'attr-1',
          name: 'Cor',
          slug: 'cor',
          type: 'text',
          values: ['Cinza']
        })
      ]
    });

    vi.mocked(useProductByIDQuery).mockReturnValue({
      data: productEmptyImages,
      isLoading: false
    } as never);

    renderComponent();

    expect(screen.getByText(/RUN-EMPTY/)).toBeInTheDocument();
  });
});
