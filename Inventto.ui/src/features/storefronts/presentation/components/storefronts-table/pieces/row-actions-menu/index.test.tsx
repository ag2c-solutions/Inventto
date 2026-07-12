import { MemoryRouter } from 'react-router';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { storefrontFactory } from '../../../../../tests/factories/storefront.factory';

import { RowActionsMenu } from './index';

const { mockUnpublish, mockPublish, mockCopyLink } = vi.hoisted(() => ({
  mockUnpublish: vi.fn(),
  mockPublish: vi.fn(),
  mockCopyLink: vi.fn()
}));

vi.mock('../../../../hooks/use-mutations', () => ({
  useUnpublishStorefrontMutation: () => ({ mutate: mockUnpublish }),
  usePublishStorefrontMutation: () => ({ mutate: mockPublish })
}));

vi.mock('./hooks/use-copy-storefront-link', () => ({
  useCopyStorefrontLink: () => ({ copyLink: mockCopyLink })
}));

vi.mock('../../../publish-dialog', () => ({
  PublishDialog: ({ open }: { open: boolean }) =>
    open ? <div data-testid="publish-dialog" /> : null
}));

vi.mock('../../../remove-storefront-dialog', () => ({
  RemoveStorefrontDialog: ({ open }: { open: boolean }) =>
    open ? <div data-testid="remove-dialog" /> : null
}));

const { mockUseIsMobile } = vi.hoisted(() => ({
  mockUseIsMobile: vi.fn(() => false)
}));

vi.mock('@/shared/hooks/use-is-mobile', () => ({
  useIsMobile: mockUseIsMobile
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
    mockUseIsMobile.mockReturnValue(false);
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

    expect(mockUnpublish).toHaveBeenCalledWith(storefront.id);
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

  it('should call the publish mutation when "Publicar" is clicked, and open the PublishDialog when prereqs are missing', async () => {
    const storefront = storefrontFactory.build({ state: 'inactive' });
    mockPublish.mockImplementation((_id, { onSuccess }) => {
      onSuccess({ published: false, missingPrereqs: ['whatsapp'] });
    });
    renderMenu(storefront);

    await user.click(screen.getByRole('button', { name: 'Ações da vitrine' }));
    await user.click(screen.getByText('Publicar'));

    expect(mockPublish).toHaveBeenCalledWith(
      storefront.id,
      expect.objectContaining({ onSuccess: expect.any(Function) })
    );
    expect(await screen.findByTestId('publish-dialog')).toBeInTheDocument();
  });

  it('should not open the PublishDialog when publishing succeeds', async () => {
    const storefront = storefrontFactory.build({ state: 'inactive' });
    mockPublish.mockImplementation((_id, { onSuccess }) => {
      onSuccess({ published: true });
    });
    renderMenu(storefront);

    await user.click(screen.getByRole('button', { name: 'Ações da vitrine' }));
    await user.click(screen.getByText('Publicar'));

    expect(screen.queryByTestId('publish-dialog')).not.toBeInTheDocument();
  });

  it('should open the RemoveStorefrontDialog when "Remover vitrine" is clicked', async () => {
    const storefront = storefrontFactory.build();
    renderMenu(storefront);

    await user.click(screen.getByRole('button', { name: 'Ações da vitrine' }));
    await user.click(screen.getByText('Remover vitrine'));

    expect(await screen.findByTestId('remove-dialog')).toBeInTheDocument();
  });

  describe('on mobile (< lg)', () => {
    beforeEach(() => {
      mockUseIsMobile.mockReturnValue(true);
    });

    it('should open a bottom sheet with the storefront name and state as the title', async () => {
      const storefront = storefrontFactory.build({
        name: 'Vitrine Ateliê Joana',
        state: 'live'
      });
      renderMenu(storefront);

      await user.click(
        screen.getByRole('button', { name: 'Ações da vitrine' })
      );

      expect(
        await screen.findByText('Vitrine Ateliê Joana · No ar')
      ).toBeInTheDocument();
    });

    it('should show Despublicar/Copiar link for a live storefront and hide Publicar', async () => {
      const storefront = storefrontFactory.build({ state: 'live' });
      renderMenu(storefront);

      await user.click(
        screen.getByRole('button', { name: 'Ações da vitrine' })
      );

      expect(await screen.findByText('Despublicar')).toBeInTheDocument();
      expect(screen.getByText('Copiar link')).toBeInTheDocument();
      expect(screen.queryByText('Publicar')).not.toBeInTheDocument();
    });

    it('should show Publicar for an inactive storefront and hide Despublicar/Copiar link', async () => {
      const storefront = storefrontFactory.build({ state: 'inactive' });
      renderMenu(storefront);

      await user.click(
        screen.getByRole('button', { name: 'Ações da vitrine' })
      );

      expect(await screen.findByText('Publicar')).toBeInTheDocument();
      expect(screen.queryByText('Despublicar')).not.toBeInTheDocument();
      expect(screen.queryByText('Copiar link')).not.toBeInTheDocument();
    });

    it('should close the sheet and call the unpublish mutation when "Despublicar" is tapped', async () => {
      const storefront = storefrontFactory.build({ state: 'live' });
      renderMenu(storefront);

      await user.click(
        screen.getByRole('button', { name: 'Ações da vitrine' })
      );
      await user.click(await screen.findByText('Despublicar'));

      expect(mockUnpublish).toHaveBeenCalledWith(storefront.id);
    });

    it('should open the RemoveStorefrontDialog when "Remover vitrine" is tapped', async () => {
      const storefront = storefrontFactory.build();
      renderMenu(storefront);

      await user.click(
        screen.getByRole('button', { name: 'Ações da vitrine' })
      );
      await user.click(await screen.findByText('Remover vitrine'));

      expect(await screen.findByTestId('remove-dialog')).toBeInTheDocument();
    });
  });
});
