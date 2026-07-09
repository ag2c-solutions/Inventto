import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CatalogHasLinkedChannelsError } from '../../../../domain/entities';
import { catalogFactory } from '../../../../tests/factories/catalog.factory';

import { RemoveCatalogDialog } from './index';

const { mockMutateAsync, mockUseRemoveCatalogMutation } = vi.hoisted(() => ({
  mockMutateAsync: vi.fn(),
  mockUseRemoveCatalogMutation: vi.fn()
}));

vi.mock('../../../hooks/use-mutations', () => ({
  useRemoveCatalogMutation: mockUseRemoveCatalogMutation
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

describe('RemoveCatalogDialog', () => {
  const user = userEvent.setup();
  const catalog = catalogFactory.build({
    name: 'Catálogo Verão',
    channelsCount: 0
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseRemoveCatalogMutation.mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false
    });
  });

  async function openDialog(target = catalog) {
    render(<RemoveCatalogDialog catalog={target} />);
    await user.click(screen.getByRole('button', { name: 'Remover catálogo' }));
    return within(screen.getByRole('dialog'));
  }

  describe('variante A (sem canais vinculados)', () => {
    it('should keep "Remover" disabled until the typed name matches exactly', async () => {
      const dialog = await openDialog();

      expect(dialog.getByText('Remover Catálogo Verão?')).toBeInTheDocument();

      const removeButton = dialog.getByRole('button', { name: 'Remover' });
      expect(removeButton).toBeDisabled();

      const input = dialog.getByLabelText(
        'Digite o nome do catálogo para confirmar'
      );
      await user.type(input, 'Catálogo Ver');
      expect(removeButton).toBeDisabled();

      await user.type(input, 'ão');
      expect(removeButton).toBeEnabled();
    });

    it('should call the mutation with the catalog id and close the dialog on success', async () => {
      mockMutateAsync.mockResolvedValue(undefined);

      const dialog = await openDialog();
      await user.type(
        dialog.getByLabelText('Digite o nome do catálogo para confirmar'),
        catalog.name
      );
      await user.click(dialog.getByRole('button', { name: 'Remover' }));

      await waitFor(() =>
        expect(mockMutateAsync).toHaveBeenCalledWith(catalog.id)
      );

      await waitFor(() =>
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      );
    });

    it('should show the "Removendo…" state while pending', async () => {
      mockUseRemoveCatalogMutation.mockReturnValue({
        mutateAsync: mockMutateAsync,
        isPending: true
      });

      const dialog = await openDialog();

      expect(dialog.getByText('Removendo…')).toBeInTheDocument();
    });

    it('should switch to the blocked variant when the server rejects with linked channels (RN061)', async () => {
      mockMutateAsync.mockRejectedValue(new CatalogHasLinkedChannelsError());

      const dialog = await openDialog();
      await user.type(
        dialog.getByLabelText('Digite o nome do catálogo para confirmar'),
        catalog.name
      );
      await user.click(dialog.getByRole('button', { name: 'Remover' }));

      expect(
        await dialog.findByText('Não é possível remover Catálogo Verão')
      ).toBeInTheDocument();
      expect(
        dialog.queryByRole('button', { name: 'Remover' })
      ).not.toBeInTheDocument();
    });

    it('should show an inline error message for other failures', async () => {
      mockMutateAsync.mockRejectedValue(new Error('Erro de conexão.'));

      const dialog = await openDialog();
      await user.type(
        dialog.getByLabelText('Digite o nome do catálogo para confirmar'),
        catalog.name
      );
      await user.click(dialog.getByRole('button', { name: 'Remover' }));

      expect(await dialog.findByText('Erro de conexão.')).toBeInTheDocument();
      expect(
        dialog.getByRole('button', { name: 'Remover' })
      ).toBeInTheDocument();
    });
  });

  describe('variante B (bloqueada por canais · RN061)', () => {
    const blockedCatalog = catalogFactory.build({
      name: 'Catálogo Loja',
      channelsCount: 2
    });

    it('should show the blocked message with the channel count and only an "Entendi" button', async () => {
      const dialog = await openDialog(blockedCatalog);

      expect(
        dialog.getByText('Não é possível remover Catálogo Loja')
      ).toBeInTheDocument();
      expect(
        dialog.getByText(
          (_, element) =>
            element?.getAttribute('data-slot') === 'dialog-description' &&
            Boolean(
              element.textContent?.includes(
                'Este catálogo está sendo usado por 2 canais.'
              )
            )
        )
      ).toBeInTheDocument();

      expect(
        dialog.getByRole('button', { name: 'Entendi' })
      ).toBeInTheDocument();
      expect(
        dialog.queryByRole('button', { name: 'Remover' })
      ).not.toBeInTheDocument();
      expect(
        dialog.queryByLabelText('Digite o nome do catálogo para confirmar')
      ).not.toBeInTheDocument();
    });

    it('should close the dialog when "Entendi" is clicked', async () => {
      const dialog = await openDialog(blockedCatalog);

      await user.click(dialog.getByRole('button', { name: 'Entendi' }));

      await waitFor(() =>
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      );
    });
  });
});
