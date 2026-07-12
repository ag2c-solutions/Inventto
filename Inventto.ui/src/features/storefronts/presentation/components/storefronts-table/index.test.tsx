import { BrowserRouter } from 'react-router';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { storefrontFactory } from '../../../tests/factories/storefront.factory';

import { StorefrontsTable } from './index';

vi.mock('../../hooks/use-mutations', () => ({
  useUnpublishStorefrontMutation: () => ({ mutate: vi.fn() })
}));

vi.mock('./pieces/row-actions-menu/hooks/use-copy-storefront-link', () => ({
  useCopyStorefrontLink: () => ({ copyLink: vi.fn() })
}));

const storefronts = [
  storefrontFactory.build({
    name: 'Vitrine Ateliê Joana',
    slug: 'atelie-joana',
    publicUrl: 'inventto.app/atelie-joana',
    catalogName: 'Coleção Verão 2026',
    state: 'live'
  }),
  storefrontFactory.build({
    name: 'Loja de Natal',
    slug: null as unknown as string,
    catalogId: undefined,
    catalogName: undefined,
    state: 'inactive',
    publicUrl: undefined
  })
];

function renderTable(
  data: ReturnType<typeof storefrontFactory.build>[],
  isLoading = false
) {
  return render(<StorefrontsTable data={data} isLoading={isLoading} />, {
    wrapper: ({ children }) => <BrowserRouter>{children}</BrowserRouter>
  });
}

describe('StorefrontsTable', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the loading skeleton when isLoading is true', () => {
    const { container } = renderTable([], true);

    expect(
      container.querySelectorAll('[data-slot="skeleton"]').length
    ).toBeGreaterThan(0);
  });

  it('should render the empty state when there are no storefronts', () => {
    renderTable([]);

    expect(screen.getByText('Nenhuma vitrine ainda.')).toBeInTheDocument();
  });

  it('should render columns Vitrine, Catálogo, Estado and Ações', () => {
    renderTable(storefronts);

    const headers = screen.getAllByRole('columnheader');
    expect(headers.map((h) => h.textContent)).toEqual([
      'Vitrine',
      'Catálogo',
      'Estado',
      'Ações'
    ]);
  });

  it('should show the slug or "sem endereço" per row', () => {
    renderTable(storefronts);

    expect(screen.getByText('inventto.app/atelie-joana')).toBeInTheDocument();
    expect(screen.getByText('sem endereço')).toBeInTheDocument();
  });

  it('should show the catalog name or "Nenhum" per row', () => {
    renderTable(storefronts);

    expect(screen.getByText('Coleção Verão 2026')).toBeInTheDocument();
    expect(screen.getByText('Nenhum')).toBeInTheDocument();
  });

  it('should show the state badge per row', () => {
    renderTable(storefronts);

    expect(screen.getByText('No ar')).toBeInTheDocument();
    expect(screen.getByText('Inativa')).toBeInTheDocument();
  });

  it('should show the "Criar vitrine" CTA', () => {
    renderTable(storefronts);

    expect(screen.getByRole('link', { name: 'Criar vitrine' })).toHaveAttribute(
      'href',
      '/storefronts/novo'
    );
  });

  it('should show an inline message with the search term when it does not match any storefront', async () => {
    renderTable(storefronts);

    await user.type(
      screen.getByPlaceholderText('Buscar vitrine por nome'),
      'inexistente'
    );

    expect(
      await screen.findByText("Nada encontrado para 'inexistente'.")
    ).toBeInTheDocument();
  });
});
