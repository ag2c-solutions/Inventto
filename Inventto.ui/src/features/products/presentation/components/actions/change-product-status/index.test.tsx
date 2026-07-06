import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockMutateAsync } = vi.hoisted(() => ({
  mockMutateAsync: vi.fn()
}));

vi.mock('../../../hooks/use-mutations', () => ({
  useChangeProductStatusMutation: () => ({
    mutateAsync: mockMutateAsync,
    isPending: false
  })
}));

import { ChangeProductStatusAction } from '.';

describe('ChangeProductStatusAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('when the product is active', () => {
    it('should open a confirmation dialog and confirm inactivation', async () => {
      mockMutateAsync.mockResolvedValue(undefined);
      const user = userEvent.setup();

      render(
        <ChangeProductStatusAction
          productId="prod-1"
          productName="Camiseta Azul"
          isActive
        />
      );

      await user.click(
        screen.getByRole('button', { name: /inativar produto/i })
      );

      expect(screen.getByText('Inativar Camiseta Azul?')).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: /^inativar$/i }));

      await waitFor(() =>
        expect(mockMutateAsync).toHaveBeenCalledWith({
          productId: 'prod-1',
          isActive: false
        })
      );

      await waitFor(() =>
        expect(
          screen.queryByText('Inativar Camiseta Azul?')
        ).not.toBeInTheDocument()
      );
    });

    it('should close the dialog without mutating when cancel is clicked', async () => {
      const user = userEvent.setup();

      render(
        <ChangeProductStatusAction
          productId="prod-1"
          productName="Camiseta Azul"
          isActive
        />
      );

      await user.click(
        screen.getByRole('button', { name: /inativar produto/i })
      );
      await user.click(screen.getByRole('button', { name: /cancelar/i }));

      expect(mockMutateAsync).not.toHaveBeenCalled();
      await waitFor(() =>
        expect(
          screen.queryByText('Inativar Camiseta Azul?')
        ).not.toBeInTheDocument()
      );
    });

    it('should keep the dialog open when the mutation fails', async () => {
      mockMutateAsync.mockRejectedValue(new Error('Falha ao inativar'));
      const user = userEvent.setup();

      render(
        <ChangeProductStatusAction
          productId="prod-1"
          productName="Camiseta Azul"
          isActive
        />
      );

      await user.click(
        screen.getByRole('button', { name: /inativar produto/i })
      );
      await user.click(screen.getByRole('button', { name: /^inativar$/i }));

      await waitFor(() => expect(mockMutateAsync).toHaveBeenCalled());
      expect(screen.getByText('Inativar Camiseta Azul?')).toBeInTheDocument();
    });
  });

  describe('when the product is inactive', () => {
    it('should reactivate the product directly without a confirmation dialog', async () => {
      mockMutateAsync.mockResolvedValue(undefined);
      const user = userEvent.setup();

      render(
        <ChangeProductStatusAction
          productId="prod-1"
          productName="Camiseta Azul"
          isActive={false}
        />
      );

      await user.click(
        screen.getByRole('button', { name: /reativar produto/i })
      );

      expect(mockMutateAsync).toHaveBeenCalledWith({
        productId: 'prod-1',
        isActive: true
      });
    });
  });
});
