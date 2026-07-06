import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { catalogFactory } from '../../../tests/factories/catalog.factory';

import { EditCatalogSheet } from './index';

const {
  mockMutateAsync,
  mockUseUpdateCatalogMutation,
  mockUseCatalogByIDQuery
} = vi.hoisted(() => ({
  mockMutateAsync: vi.fn(),
  mockUseUpdateCatalogMutation: vi.fn(),
  mockUseCatalogByIDQuery: vi.fn()
}));

vi.mock('../../hooks/use-mutations', () => ({
  useUpdateCatalogMutation: mockUseUpdateCatalogMutation
}));

vi.mock('../../hooks/use-queries', () => ({
  useCatalogByIDQuery: mockUseCatalogByIDQuery
}));

vi.mock('@/features/permissions', () => ({
  ActionButton: ({
    action: _action,
    children,
    ...props
  }: React.ComponentProps<'button'> & { action: string }) => (
    <button type="button" {...props}>
      {children}
    </button>
  )
}));

describe('EditCatalogSheet', () => {
  const user = userEvent.setup();
  const catalog = catalogFactory.build({ name: 'Catálogo Verão' });

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseUpdateCatalogMutation.mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false
    });
    mockUseCatalogByIDQuery.mockReturnValue({
      data: catalog,
      isLoading: false
    });
  });

  async function openSheet() {
    await user.click(screen.getByRole('button', { name: 'Editar catálogo' }));
    return within(screen.getByRole('dialog'));
  }

  it('should not fetch the catalog before the sheet is opened', () => {
    render(<EditCatalogSheet catalogId={catalog.id} />);

    expect(mockUseCatalogByIDQuery).toHaveBeenCalledWith('');
  });

  it('should fetch the catalog by id once opened', async () => {
    render(<EditCatalogSheet catalogId={catalog.id} />);

    await openSheet();

    expect(mockUseCatalogByIDQuery).toHaveBeenCalledWith(catalog.id);
  });

  it('should show the loading skeleton while the catalog loads', async () => {
    mockUseCatalogByIDQuery.mockReturnValue({
      data: undefined,
      isLoading: true
    });

    render(<EditCatalogSheet catalogId={catalog.id} />);
    await openSheet();

    expect(
      document.querySelectorAll('[data-slot="skeleton"]').length
    ).toBeGreaterThan(0);
    expect(screen.queryByLabelText('Nome do catálogo')).not.toBeInTheDocument();
  });

  it('should pre-fill the name field with the loaded catalog', async () => {
    render(<EditCatalogSheet catalogId={catalog.id} />);

    const sheet = await openSheet();

    expect(sheet.getByDisplayValue('Catálogo Verão')).toBeInTheDocument();
  });

  it('should show the empty linked channels message', async () => {
    render(<EditCatalogSheet catalogId={catalog.id} />);

    const sheet = await openSheet();

    expect(
      sheet.getByText('Nenhum canal vinculado a este catálogo.')
    ).toBeInTheDocument();
  });

  it('should show an inline error when saving with an empty name', async () => {
    render(<EditCatalogSheet catalogId={catalog.id} />);

    const sheet = await openSheet();
    await user.clear(sheet.getByPlaceholderText('Nome do catálogo'));
    await user.click(sheet.getByRole('button', { name: 'Salvar' }));

    expect(
      await sheet.findByText('Informe um nome para o catálogo.')
    ).toBeInTheDocument();
    expect(mockMutateAsync).not.toHaveBeenCalled();
  });

  it('should save the updated name', async () => {
    render(<EditCatalogSheet catalogId={catalog.id} />);

    const sheet = await openSheet();
    const nameInput = sheet.getByPlaceholderText('Nome do catálogo');
    await user.clear(nameInput);
    await user.type(nameInput, 'Catálogo Inverno');
    await user.click(sheet.getByRole('button', { name: 'Salvar' }));

    await waitFor(() =>
      expect(mockMutateAsync).toHaveBeenCalledWith({
        id: catalog.id,
        name: 'Catálogo Inverno'
      })
    );
  });

  it('should show the "Salvando…" loading state while pending', async () => {
    mockUseUpdateCatalogMutation.mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: true
    });

    render(<EditCatalogSheet catalogId={catalog.id} />);
    const sheet = await openSheet();

    expect(sheet.getByText('Salvando…')).toBeInTheDocument();
  });

  it('should close the sheet when "Cancelar" is clicked', async () => {
    render(<EditCatalogSheet catalogId={catalog.id} />);

    const sheet = await openSheet();
    await user.click(sheet.getByRole('button', { name: 'Cancelar' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
