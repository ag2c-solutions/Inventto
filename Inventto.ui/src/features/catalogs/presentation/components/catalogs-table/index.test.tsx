import { BrowserRouter } from 'react-router';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { catalogFactory } from '../../../tests/factories/catalog.factory';

import { CatalogsTable } from './index';

const mockUseUser = vi.fn();

vi.mock('@/features/users', () => ({
  useUser: () => mockUseUser()
}));

const catalogs = [
  catalogFactory.build({
    name: 'Catálogo Verão',
    productsCount: 12,
    channelsCount: 0
  }),
  catalogFactory.build({
    name: 'Catálogo Atacado',
    productsCount: 3,
    channelsCount: 2
  })
];

describe('CatalogsTable', () => {
  const user = userEvent.setup();
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <BrowserRouter>{children}</BrowserRouter>
  );

  beforeEach(() => {
    mockUseUser.mockReturnValue({ role: 'owner' });
  });

  it('should render the loading skeleton when isLoading is true', () => {
    const { container } = render(<CatalogsTable data={[]} isLoading />, {
      wrapper
    });

    expect(
      container.querySelectorAll('[data-slot="skeleton"]').length
    ).toBeGreaterThan(0);
  });

  it('should render the empty state when there are no catalogs', () => {
    render(<CatalogsTable data={[]} isLoading={false} />, { wrapper });

    expect(screen.getByText('Nenhum catálogo ainda.')).toBeInTheDocument();
  });

  it('should render columns Catálogo, Produtos, Canais vinculados and Ações for manager/owner', () => {
    render(<CatalogsTable data={catalogs} isLoading={false} />, { wrapper });

    const headers = screen.getAllByRole('columnheader');
    expect(headers.map((h) => h.textContent)).toEqual([
      'Catálogo',
      'Produtos',
      'Canais vinculados',
      'Ações'
    ]);
  });

  it('should render the products count linking to the curation route', () => {
    render(<CatalogsTable data={catalogs} isLoading={false} />, { wrapper });

    const link = screen.getByRole('link', { name: /12/ });
    expect(link).toHaveAttribute(
      'href',
      `/catalogos/${catalogs[0].id}/produtos`
    );
  });

  it('should show "Nenhum" when the catalog has no linked channels', () => {
    render(<CatalogsTable data={catalogs} isLoading={false} />, { wrapper });

    expect(screen.getByText('Nenhum')).toBeInTheDocument();
    expect(screen.getByText('2 canais')).toBeInTheDocument();
  });

  it('should show the "Criar catálogo" CTA and action icons for manager/owner', () => {
    render(<CatalogsTable data={catalogs} isLoading={false} />, { wrapper });

    expect(
      screen.getByRole('button', { name: 'Criar catálogo' })
    ).toBeInTheDocument();
    expect(screen.getAllByTitle('Editar catálogo')).toHaveLength(2);
    expect(screen.getAllByTitle('Remover catálogo')).toHaveLength(2);
  });

  it('should hide the "Criar catálogo" CTA and the Ações column for sales', () => {
    mockUseUser.mockReturnValue({ role: 'sales' });

    render(<CatalogsTable data={catalogs} isLoading={false} />, { wrapper });

    expect(
      screen.queryByRole('button', { name: 'Criar catálogo' })
    ).not.toBeInTheDocument();
    expect(screen.queryByTitle('Editar catálogo')).not.toBeInTheDocument();
    expect(screen.queryByTitle('Remover catálogo')).not.toBeInTheDocument();

    const headers = screen.getAllByRole('columnheader');
    expect(headers.map((h) => h.textContent)).toEqual([
      'Catálogo',
      'Produtos',
      'Canais vinculados'
    ]);
  });

  it('should show an inline message with the search term when it does not match any catalog', async () => {
    render(<CatalogsTable data={catalogs} isLoading={false} />, { wrapper });

    await user.type(
      screen.getByPlaceholderText('Buscar catálogo por nome'),
      'inexistente'
    );

    expect(
      await screen.findByText("Nada encontrado para 'inexistente'.")
    ).toBeInTheDocument();
  });
});
