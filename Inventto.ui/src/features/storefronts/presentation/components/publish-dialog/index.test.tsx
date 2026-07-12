import { MemoryRouter } from 'react-router';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { storefrontFactory } from '../../../tests/factories/storefront.factory';

import { PublishDialog } from './index';

const { mockUsePublishPrereqs } = vi.hoisted(() => ({
  mockUsePublishPrereqs: vi.fn()
}));

vi.mock('./hooks/use-publish-prereqs', () => ({
  usePublishPrereqs: mockUsePublishPrereqs
}));

function renderDialog(storefront = storefrontFactory.build()) {
  return render(
    <MemoryRouter>
      <PublishDialog storefront={storefront} open onOpenChange={vi.fn()} />
    </MemoryRouter>
  );
}

describe('PublishDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show pending items with a shortcut and completed items with a check', () => {
    mockUsePublishPrereqs.mockReturnValue({
      items: [
        {
          key: 'catalog',
          title: 'Vincule um catálogo',
          subtitle: 'Os produtos e preços vêm do catálogo.',
          href: '/storefronts/s1',
          done: true
        },
        {
          key: 'whatsapp',
          title: 'Informe o WhatsApp',
          subtitle: 'Canal que recebe os pedidos da vitrine.',
          href: '/storefronts/s1',
          done: false
        }
      ],
      isLoading: false,
      allDone: false,
      firstPendingHref: '/storefronts/s1'
    });

    renderDialog();

    expect(screen.getByText('Quase lá para publicar')).toBeInTheDocument();
    expect(screen.getByText('Vincule um catálogo')).toBeInTheDocument();
    expect(screen.getByText('Informe o WhatsApp')).toBeInTheDocument();

    // Item pendente vira link clicável; item cumprido não.
    expect(
      screen.getByRole('link', { name: /Informe o WhatsApp/ })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: /Vincule um catálogo/ })
    ).not.toBeInTheDocument();
  });

  it('should show the storefront name in the lead paragraph', () => {
    mockUsePublishPrereqs.mockReturnValue({
      items: [],
      isLoading: false,
      allDone: true,
      firstPendingHref: undefined
    });

    renderDialog(storefrontFactory.build({ name: 'Loja de Natal' }));

    expect(
      screen.getByText('Para publicar Loja de Natal, ainda falta:')
    ).toBeInTheDocument();
  });

  it('should link "Completar configuração" to the first pending item', () => {
    mockUsePublishPrereqs.mockReturnValue({
      items: [],
      isLoading: false,
      allDone: false,
      firstPendingHref: '/settings?tab=schedule'
    });

    renderDialog();

    expect(
      screen.getByRole('link', { name: 'Completar configuração' })
    ).toHaveAttribute('href', '/settings?tab=schedule');
  });
});
