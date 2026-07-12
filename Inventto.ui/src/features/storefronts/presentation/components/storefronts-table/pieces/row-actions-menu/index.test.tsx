import { MemoryRouter } from 'react-router';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { storefrontFactory } from '../../../../../tests/factories/storefront.factory';

import { RowActionsMenu } from './index';

const { mockMutate, mockCopyLink } = vi.hoisted(() => ({
  mockMutate: vi.fn(),
  mockCopyLink: vi.fn()
}));

vi.mock('../../../../hooks/use-mutations', () => ({
  useUnpublishStorefrontMutation: () => ({ mutate: mockMutate })
}));

vi.mock('./hooks/use-copy-storefront-link', () => ({
  useCopyStorefrontLink: () => ({ copyLink: mockCopyLink })
}));

function renderMenu(storefront: ReturnType<typeof storefrontFactory.build>) {
  render(
    <MemoryRouter>
      <RowActionsMenu storefront={storefront} />
    </MemoryRouter>
  );
}

describe('RowActionsMenu', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show Despublicar and Copiar link for a live storefront, plus Configurar/Remover', async () => {
    const storefront = storefrontFactory.build({ state: 'live' });
    renderMenu(storefront);

    await user.click(screen.getByRole('button', { name: 'Ações da vitrine' }));

    expect(screen.getByText('Configurar')).toBeInTheDocument();
    expect(screen.getByText('Despublicar')).toBeInTheDocument();
    expect(screen.getByText('Copiar link')).toBeInTheDocument();
    expect(screen.getByText('Remover vitrine')).toBeInTheDocument();
    expect(screen.queryByText('Publicar')).not.toBeInTheDocument();
  });

  it('should show Publicar for an inactive storefront, plus Configurar/Remover', async () => {
    const storefront = storefrontFactory.build({ state: 'inactive' });
    renderMenu(storefront);

    await user.click(screen.getByRole('button', { name: 'Ações da vitrine' }));

    expect(screen.getByText('Configurar')).toBeInTheDocument();
    expect(screen.getByText('Publicar')).toBeInTheDocument();
    expect(screen.getByText('Remover vitrine')).toBeInTheDocument();
    expect(screen.queryByText('Despublicar')).not.toBeInTheDocument();
    expect(screen.queryByText('Copiar link')).not.toBeInTheDocument();
  });

  it('should call the unpublish mutation when "Despublicar" is clicked', async () => {
    const storefront = storefrontFactory.build({ state: 'live' });
    renderMenu(storefront);

    await user.click(screen.getByRole('button', { name: 'Ações da vitrine' }));
    await user.click(screen.getByText('Despublicar'));

    expect(mockMutate).toHaveBeenCalledWith(storefront.id);
  });

  it('should copy the public link when "Copiar link" is clicked', async () => {
    const storefront = storefrontFactory.build({
      state: 'live',
      publicUrl: 'inventto.app/atelie-joana'
    });
    renderMenu(storefront);

    await user.click(screen.getByRole('button', { name: 'Ações da vitrine' }));
    await user.click(screen.getByText('Copiar link'));

    expect(mockCopyLink).toHaveBeenCalledWith('inventto.app/atelie-joana');
  });

  it('should link "Configurar" to the storefront config route', async () => {
    const storefront = storefrontFactory.build();
    renderMenu(storefront);

    await user.click(screen.getByRole('button', { name: 'Ações da vitrine' }));

    expect(
      screen.getByRole('menuitem', { name: /configurar/i })
    ).toHaveAttribute('href', `/storefronts/${storefront.id}`);
  });
});
