import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CreateCatalogDialog } from './index';

const { mockMutateAsync, mockUseCreateCatalogMutation } = vi.hoisted(() => ({
  mockMutateAsync: vi.fn(),
  mockUseCreateCatalogMutation: vi.fn()
}));

vi.mock('../../hooks/use-mutations', () => ({
  useCreateCatalogMutation: mockUseCreateCatalogMutation
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

describe('CreateCatalogDialog', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseCreateCatalogMutation.mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false
    });
  });

  async function openDialog() {
    await user.click(screen.getByRole('button', { name: 'Criar catálogo' }));
    return within(screen.getByRole('dialog'));
  }

  it('should open the dialog with the "Novo catálogo" title when the trigger is clicked', async () => {
    render(<CreateCatalogDialog />);

    const dialog = await openDialog();

    expect(dialog.getByText('Novo catálogo')).toBeInTheDocument();
  });

  it('should show an inline error when submitting with an empty name', async () => {
    render(<CreateCatalogDialog />);

    const dialog = await openDialog();
    await user.click(dialog.getByRole('button', { name: 'Criar catálogo' }));

    expect(
      await dialog.findByText('Informe um nome para o catálogo.')
    ).toBeInTheDocument();
    expect(mockMutateAsync).not.toHaveBeenCalled();
  });

  it('should call the mutation with the entered name', async () => {
    render(<CreateCatalogDialog />);

    const dialog = await openDialog();
    await user.type(
      dialog.getByPlaceholderText('Nome do catálogo'),
      'Catálogo Verão'
    );
    await user.click(dialog.getByRole('button', { name: 'Criar catálogo' }));

    await waitFor(() =>
      expect(mockMutateAsync).toHaveBeenCalledWith({ name: 'Catálogo Verão' })
    );
  });

  it('should close the dialog when "Cancelar" is clicked', async () => {
    render(<CreateCatalogDialog />);

    const dialog = await openDialog();
    await user.click(dialog.getByRole('button', { name: 'Cancelar' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should show the "Criando..." loading state while pending', async () => {
    mockUseCreateCatalogMutation.mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: true
    });

    render(<CreateCatalogDialog />);

    const dialog = await openDialog();

    expect(dialog.getByText('Criando...')).toBeInTheDocument();
  });
});
