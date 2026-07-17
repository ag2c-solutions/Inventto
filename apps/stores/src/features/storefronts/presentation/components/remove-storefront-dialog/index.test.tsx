import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { storefrontFactory } from '../../../tests/factories/storefront.factory';

import { RemoveStorefrontDialog } from './index';

const { mockMutateAsync, mockUseRemoveStorefrontMutation } = vi.hoisted(() => ({
  mockMutateAsync: vi.fn(),
  mockUseRemoveStorefrontMutation: vi.fn()
}));

vi.mock('../../hooks/use-mutations', () => ({
  useRemoveStorefrontMutation: mockUseRemoveStorefrontMutation
}));

describe('RemoveStorefrontDialog', () => {
  const user = userEvent.setup();
  const storefront = storefrontFactory.build({
    name: 'Vitrine Ateliê Joana',
    publicUrl: 'inventto.app/atelie-joana'
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseRemoveStorefrontMutation.mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false
    });
  });

  it('should show the exact microcopy with the storefront name and link', () => {
    render(
      <RemoveStorefrontDialog
        storefront={storefront}
        open
        onOpenChange={vi.fn()}
      />
    );

    expect(
      screen.getByText('Remover Vitrine Ateliê Joana?')
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'A vitrine sai do ar e o link inventto.app/atelie-joana deixa de funcionar. O catálogo e os produtos não são afetados.'
      )
    ).toBeInTheDocument();
  });

  it('should keep "Remover vitrine" disabled until the name matches exactly (idle)', () => {
    render(
      <RemoveStorefrontDialog
        storefront={storefront}
        open
        onOpenChange={vi.fn()}
      />
    );

    expect(
      screen.getByRole('button', { name: 'Remover vitrine' })
    ).toBeDisabled();
  });

  it('should enable "Remover vitrine" once the name is typed exactly (confirmed)', async () => {
    render(
      <RemoveStorefrontDialog
        storefront={storefront}
        open
        onOpenChange={vi.fn()}
      />
    );

    await user.type(
      screen.getByLabelText('Digite o nome da vitrine para confirmar'),
      'Vitrine Ateliê Joana'
    );

    expect(
      screen.getByRole('button', { name: 'Remover vitrine' })
    ).toBeEnabled();
  });

  it('should call the mutation with the id/confirmation/expectedName and close on success', async () => {
    mockMutateAsync.mockResolvedValue(undefined);
    const onOpenChange = vi.fn();

    render(
      <RemoveStorefrontDialog
        storefront={storefront}
        open
        onOpenChange={onOpenChange}
      />
    );

    await user.type(
      screen.getByLabelText('Digite o nome da vitrine para confirmar'),
      'Vitrine Ateliê Joana'
    );
    await user.click(screen.getByRole('button', { name: 'Remover vitrine' }));

    expect(mockMutateAsync).toHaveBeenCalledWith({
      id: storefront.id,
      confirmation: 'Vitrine Ateliê Joana',
      expectedName: 'Vitrine Ateliê Joana'
    });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('should show "Removendo…" while the mutation is pending (saving)', () => {
    mockUseRemoveStorefrontMutation.mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: true
    });

    render(
      <RemoveStorefrontDialog
        storefront={storefront}
        open
        onOpenChange={vi.fn()}
      />
    );

    expect(screen.getByRole('button', { name: 'Removendo…' })).toBeDisabled();
  });
});
