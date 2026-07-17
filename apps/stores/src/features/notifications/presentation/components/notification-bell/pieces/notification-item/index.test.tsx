import { MemoryRouter } from 'react-router';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { notificationFactory } from '../../../../../tests/factories/notification.factory';

import { NotificationItem } from '.';

function renderWithRouter(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe('NotificationItem', () => {
  it('should render the notification message and link to its route', () => {
    const notification = notificationFactory.build({
      type: 'new-order',
      message: 'Novo pedido recebido.',
      route: '/pedidos/order-1'
    });

    renderWithRouter(
      <NotificationItem notification={notification} onClose={vi.fn()} />
    );

    expect(screen.getByText('Novo pedido recebido.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ver pedido' })).toHaveAttribute(
      'href',
      '/pedidos/order-1'
    );
  });

  it('should show "Ver produtos" for a low-stock notification', () => {
    const notification = notificationFactory.build({
      type: 'low-stock',
      route: '/produtos'
    });

    renderWithRouter(
      <NotificationItem notification={notification} onClose={vi.fn()} />
    );

    expect(screen.getByRole('link', { name: 'Ver produtos' })).toHaveAttribute(
      'href',
      '/produtos'
    );
  });

  it('should call onClose when the link is clicked', async () => {
    const onClose = vi.fn();
    const notification = notificationFactory.build();
    const user = userEvent.setup();

    renderWithRouter(
      <NotificationItem notification={notification} onClose={onClose} />
    );

    await user.click(screen.getByRole('link'));

    expect(onClose).toHaveBeenCalledOnce();
  });
});
