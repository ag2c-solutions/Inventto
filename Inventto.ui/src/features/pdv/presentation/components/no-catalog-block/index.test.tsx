import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { NoCatalogBlock } from './index';

const { mockCan, mockUseCatalogsQuery, mockUseSetPdvCatalogMutation } =
  vi.hoisted(() => ({
    mockCan: vi.fn(),
    mockUseCatalogsQuery: vi.fn(),
    mockUseSetPdvCatalogMutation: vi.fn()
  }));

vi.mock('@/features/permissions', () => ({
  usePermission: () => ({ can: mockCan })
}));

vi.mock('@/features/catalogs', () => ({
  useCatalogsQuery: mockUseCatalogsQuery
}));

vi.mock('../../hooks/use-set-pdv-catalog', () => ({
  useSetPdvCatalogMutation: mockUseSetPdvCatalogMutation
}));

describe('NoCatalogBlock', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseCatalogsQuery.mockReturnValue({
      data: [{ id: 'cat-1', name: 'Loja Física' }]
    });
    mockUseSetPdvCatalogMutation.mockReturnValue({
      mutate: vi.fn(),
      isPending: false
    });
  });

  it('should render the exact microcopy', () => {
    mockCan.mockReturnValue(true);

    render(<NoCatalogBlock />);

    expect(
      screen.getByRole('heading', {
        name: 'Vincule um catálogo ao PDV para começar a vender.'
      })
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'O balcão usa um catálogo de PDV para saber o que está à venda e por quanto. Escolha ou crie um catálogo com ao menos um produto.'
      )
    ).toBeInTheDocument();
  });

  it('should show the "Escolher catálogo" CTA for manager/owner', () => {
    mockCan.mockReturnValue(true);

    render(<NoCatalogBlock />);

    expect(
      screen.getByRole('button', { name: 'Escolher catálogo' })
    ).toBeInTheDocument();
  });

  it('should hide the CTA and show the orientation hint for sales', () => {
    mockCan.mockReturnValue(false);

    render(<NoCatalogBlock />);

    expect(
      screen.queryByRole('button', { name: 'Escolher catálogo' })
    ).not.toBeInTheDocument();
    expect(
      screen.getByText('Peça a um gestor para vincular um catálogo ao PDV.')
    ).toBeInTheDocument();
  });

  it('should show a fallback message when manager/owner has no catalogs to pick from', () => {
    mockCan.mockReturnValue(true);
    mockUseCatalogsQuery.mockReturnValue({ data: [] });

    render(<NoCatalogBlock />);

    expect(
      screen.getByText(
        'Nenhum catálogo disponível — crie um catálogo primeiro.'
      )
    ).toBeInTheDocument();
  });
});
