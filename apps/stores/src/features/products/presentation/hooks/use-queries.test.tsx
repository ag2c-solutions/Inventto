import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ProductAPI } from '../../data/api';
import { ProductService } from '../../domain/services';
import {
  importCandidateFactory,
  importCandidateVariantFactory
} from '../../tests/factories/import-candidate.factory';
import {
  productAttributeFactory,
  productFactory
} from '../../tests/factories/product.factory';

import {
  useGlobalAttributesQuery,
  useImportCandidatesQuery,
  useProductByIDQuery,
  useProductMovementsQuery,
  useProductsQuery,
  useSkuAvailabilityQuery,
  useSourceProductVariantsQuery
} from './use-queries';

const { mockUseUser } = vi.hoisted(() => ({
  mockUseUser: vi.fn()
}));

vi.mock('@/features/users', () => ({
  useUser: () => mockUseUser()
}));

vi.mock('../../domain/services', () => ({
  ProductService: {
    getAll: vi.fn(),
    getOneById: vi.fn(),
    getImportCandidates: vi.fn(),
    getSourceProductVariants: vi.fn(),
    checkHasMovements: vi.fn()
  }
}));

vi.mock('../../data/api', () => ({
  ProductAPI: {
    getGlobalAttributes: vi.fn(),
    checkSkuAvailability: vi.fn()
  }
}));

let queryClient: QueryClient;

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

beforeEach(() => {
  vi.clearAllMocks();
  mockUseUser.mockReturnValue({
    currentOrganization: { id: 'org-1' },
    role: 'manager'
  });
  queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  });
});

describe('useProductsQuery', () => {
  it('deve chamar ProductService.getAll com organization e role', async () => {
    vi.mocked(ProductService.getAll).mockResolvedValue([]);

    const { result } = renderHook(() => useProductsQuery(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(ProductService.getAll).toHaveBeenCalledWith(
      { id: 'org-1' },
      'manager'
    );
  });

  it('deve ter fetchStatus idle quando currentOrganization é null', () => {
    mockUseUser.mockReturnValue({
      currentOrganization: null as unknown as { id: string },
      role: 'manager'
    });
    const { result } = renderHook(() => useProductsQuery(), { wrapper });
    expect(result.current.fetchStatus).toBe('idle');
    expect(ProductService.getAll).not.toHaveBeenCalled();
  });

  it('deve ter fetchStatus idle quando role é undefined', () => {
    mockUseUser.mockReturnValue({
      currentOrganization: { id: 'org-1' },
      role: undefined as unknown as string
    });
    const { result } = renderHook(() => useProductsQuery(), { wrapper });
    expect(result.current.fetchStatus).toBe('idle');
    expect(ProductService.getAll).not.toHaveBeenCalled();
  });

  it('deve refletir erro quando ProductService.getAll falha', async () => {
    vi.mocked(ProductService.getAll).mockRejectedValue(
      new Error('Erro ao buscar produtos')
    );

    const { result } = renderHook(() => useProductsQuery(), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toBe('Erro ao buscar produtos');
  });
});

describe('useProductByIDQuery', () => {
  it('deve chamar ProductService.getOneById com o productId fornecido', async () => {
    const product = productFactory.build();
    vi.mocked(ProductService.getOneById).mockResolvedValue(product);
    const { result } = renderHook(() => useProductByIDQuery(product.id), {
      wrapper
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(ProductService.getOneById).toHaveBeenCalledWith(product.id);
    expect(result.current.data).toEqual(product);
  });

  it('deve ter fetchStatus idle quando productId é undefined', () => {
    const { result } = renderHook(() => useProductByIDQuery(undefined), {
      wrapper
    });
    expect(result.current.fetchStatus).toBe('idle');
    expect(ProductService.getOneById).not.toHaveBeenCalled();
  });

  it('deve refletir erro quando ProductService.getOneById falha', async () => {
    vi.mocked(ProductService.getOneById).mockRejectedValue(
      new Error('Produto não encontrado.')
    );
    const { result } = renderHook(() => useProductByIDQuery('missing'), {
      wrapper
    });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toBe('Produto não encontrado.');
  });
});

describe('useSkuAvailabilityQuery', () => {
  it('deve chamar ProductAPI.checkSkuAvailability com o sku normalizado', async () => {
    vi.mocked(ProductAPI.checkSkuAvailability).mockResolvedValue(true);

    const { result } = renderHook(
      () => useSkuAvailabilityQuery({ sku: '  SKU-1  ' }),
      { wrapper }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(ProductAPI.checkSkuAvailability).toHaveBeenCalledWith({
      organizationId: 'org-1',
      sku: 'SKU-1',
      excludeProductId: undefined
    });
    expect(result.current.data).toBe(true);
  });

  it('deve ficar idle quando o sku é vazio', () => {
    const { result } = renderHook(
      () => useSkuAvailabilityQuery({ sku: '   ' }),
      { wrapper }
    );

    expect(result.current.fetchStatus).toBe('idle');
    expect(ProductAPI.checkSkuAvailability).not.toHaveBeenCalled();
  });

  it('deve ficar idle quando enabled é false', () => {
    const { result } = renderHook(
      () => useSkuAvailabilityQuery({ sku: 'SKU-1', enabled: false }),
      { wrapper }
    );

    expect(result.current.fetchStatus).toBe('idle');
    expect(ProductAPI.checkSkuAvailability).not.toHaveBeenCalled();
  });
});

describe('useGlobalAttributesQuery', () => {
  it('deve retornar os atributos globais', async () => {
    const attribute = productAttributeFactory.build();
    vi.mocked(ProductAPI.getGlobalAttributes).mockResolvedValue([attribute]);

    const { result } = renderHook(() => useGlobalAttributesQuery(), {
      wrapper
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([attribute]);
  });
});

describe('useImportCandidatesQuery', () => {
  it('deve chamar ProductService.getImportCandidates quando origem e organização existem', async () => {
    const candidates = importCandidateFactory.buildList(2);
    vi.mocked(ProductService.getImportCandidates).mockResolvedValue(candidates);

    const { result } = renderHook(() => useImportCandidatesQuery('org-2'), {
      wrapper
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(ProductService.getImportCandidates).toHaveBeenCalledWith('org-2', {
      id: 'org-1'
    });
    expect(result.current.data).toEqual(candidates);
  });

  it('deve ficar idle quando sourceOrganizationId não é informado', () => {
    const { result } = renderHook(() => useImportCandidatesQuery(undefined), {
      wrapper
    });

    expect(result.current.fetchStatus).toBe('idle');
    expect(ProductService.getImportCandidates).not.toHaveBeenCalled();
  });
});

describe('useSourceProductVariantsQuery', () => {
  it('deve chamar ProductService.getSourceProductVariants com os parâmetros informados', async () => {
    const variants = [importCandidateVariantFactory.build()];
    vi.mocked(ProductService.getSourceProductVariants).mockResolvedValue(
      variants
    );

    const { result } = renderHook(
      () =>
        useSourceProductVariantsQuery({
          sourceOrganizationId: 'org-2',
          productId: 'prod-1'
        }),
      { wrapper }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(ProductService.getSourceProductVariants).toHaveBeenCalledWith(
      'org-2',
      'prod-1'
    );
    expect(result.current.data).toEqual(variants);
  });

  it('deve ficar idle quando enabled é false', () => {
    const { result } = renderHook(
      () =>
        useSourceProductVariantsQuery({
          sourceOrganizationId: 'org-2',
          productId: 'prod-1',
          enabled: false
        }),
      { wrapper }
    );

    expect(result.current.fetchStatus).toBe('idle');
    expect(ProductService.getSourceProductVariants).not.toHaveBeenCalled();
  });
});

describe('useProductMovementsQuery', () => {
  it('deve chamar ProductService.checkHasMovements com o productId', async () => {
    vi.mocked(ProductService.checkHasMovements).mockResolvedValue(true);

    const { result } = renderHook(() => useProductMovementsQuery('p-1'), {
      wrapper
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(ProductService.checkHasMovements).toHaveBeenCalledWith('p-1');
    expect(result.current.data).toBe(true);
  });

  it('deve ficar idle quando productId não é informado', () => {
    const { result } = renderHook(() => useProductMovementsQuery(undefined), {
      wrapper
    });

    expect(result.current.fetchStatus).toBe('idle');
    expect(ProductService.checkHasMovements).not.toHaveBeenCalled();
  });
});
