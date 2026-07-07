import { MemoryRouter, Route, Routes } from 'react-router';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { catalogFactory } from '../../../tests/factories/catalog.factory';
import { catalogItemFactory } from '../../../tests/factories/catalog-item.factory';

import { CatalogCurationPage } from './index';

const { mockUseCatalogByIDQuery, mockUseCatalogItemsQuery } = vi.hoisted(
  () => ({
    mockUseCatalogByIDQuery: vi.fn(),
    mockUseCatalogItemsQuery: vi.fn()
  })
);

vi.mock('../../hooks/use-queries', () => ({
  useCatalogByIDQuery: mockUseCatalogByIDQuery,
  useCatalogItemsQuery: mockUseCatalogItemsQuery
}));

vi.mock('../../components/add-products-sheet', () => ({
  AddProductsSheet: () => <button type="button">Adicionar produtos</button>
}));

vi.mock('../../components/curation-item', () => ({
  CurationItem: ({ item }: { item: { product: { name: string } } }) => (
    <div data-testid="curation-item">{item.product.name}</div>
  )
}));

function renderPage(catalogId = 'cat-1') {
  return render(
    <MemoryRouter initialEntries={[`/catalogos/${catalogId}/produtos`]}>
      <Routes>
        <Route
          path="/catalogos/:catalogId/produtos"
          element={<CatalogCurationPage />}
        />
      </Routes>
    </MemoryRouter>
  );
}

describe('CatalogCurationPage', () => {
  const catalog = catalogFactory.build({ id: 'cat-1', name: 'Loja Física' });

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseCatalogByIDQuery.mockReturnValue({ data: catalog });
  });

  it('should render the heading with the catalog name', () => {
    mockUseCatalogItemsQuery.mockReturnValue({ data: [], isLoading: false });

    renderPage();

    expect(
      screen.getByRole('heading', { name: 'Produtos — Loja Física' })
    ).toBeInTheDocument();
  });

  it('should render the loading skeleton while items load', () => {
    mockUseCatalogItemsQuery.mockReturnValue({
      data: undefined,
      isLoading: true
    });

    const { container } = renderPage();

    expect(
      container.querySelectorAll('[data-slot="skeleton"]').length
    ).toBeGreaterThan(0);
  });

  it('should render the empty state when there are no items', () => {
    mockUseCatalogItemsQuery.mockReturnValue({ data: [], isLoading: false });

    renderPage();

    expect(
      screen.getByText('Nenhum produto neste catálogo.')
    ).toBeInTheDocument();
  });

  it('should render a CurationItem for each item', () => {
    const items = catalogItemFactory.buildList(2);
    mockUseCatalogItemsQuery.mockReturnValue({ data: items, isLoading: false });

    renderPage();

    expect(screen.getAllByTestId('curation-item')).toHaveLength(2);
  });

  it('should show the aggregated warning when items are pending a price', () => {
    const items = [
      catalogItemFactory.build({ price: 0 }),
      catalogItemFactory.build({ price: 50 })
    ];
    mockUseCatalogItemsQuery.mockReturnValue({ data: items, isLoading: false });

    renderPage();

    expect(
      screen.getByText((_, element) =>
        Boolean(
          element?.textContent?.startsWith(
            '1 item recém-adicionado precisa de preço.'
          )
        )
      )
    ).toBeInTheDocument();
  });

  it('should filter items by search term', async () => {
    const user = userEvent.setup();
    const items = [
      catalogItemFactory.build({
        product: { id: '1', name: 'Cadeira', sku: 'CAD-1', imageUrl: undefined }
      }),
      catalogItemFactory.build({
        product: { id: '2', name: 'Mesa', sku: 'MES-1', imageUrl: undefined }
      })
    ];
    mockUseCatalogItemsQuery.mockReturnValue({ data: items, isLoading: false });

    renderPage();

    await user.type(
      screen.getByPlaceholderText('Buscar produto ou SKU neste catálogo'),
      'Mesa'
    );

    expect(screen.getAllByTestId('curation-item')).toHaveLength(1);
    expect(screen.getByText('Mesa')).toBeInTheDocument();
  });
});
