import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { orderFactory } from '../../../tests/factories/order.factory';

import { OrderMetaCard } from './index';

describe('OrderMetaCard', () => {
  it('should show "Pool" as the seller for pool orders', () => {
    const order = orderFactory.build({
      macroState: 'pool',
      sellerName: undefined
    });

    render(<OrderMetaCard order={order} />);

    expect(screen.getByText('Pool')).toBeInTheDocument();
  });

  it('should show the seller name for attending orders', () => {
    const order = orderFactory.build({
      macroState: 'attending',
      sellerName: 'Joana Ateliê'
    });

    render(<OrderMetaCard order={order} />);

    expect(screen.getByText('Joana Ateliê')).toBeInTheDocument();
  });

  it('should show the origin with the catalog name (RN083)', () => {
    const order = orderFactory.build({ catalogName: 'Coleção Inverno' });

    render(<OrderMetaCard order={order} />);

    expect(
      screen.getByText('Vitrine online · Coleção Inverno')
    ).toBeInTheDocument();
  });

  it('should show the expiration timer for pool orders', () => {
    const order = orderFactory.build({
      macroState: 'pool',
      expiresAt: new Date(Date.now() + 5 * 60 * 1000)
    });

    render(<OrderMetaCard order={order} />);

    expect(screen.getByText('Expira em')).toBeInTheDocument();
  });

  it('should show the payment method (RN083)', () => {
    const order = orderFactory.build({ paymentMethod: 'pix' });

    render(<OrderMetaCard order={order} />);

    expect(screen.getByText('Pix (offline)')).toBeInTheDocument();
  });

  it('should show the cancellation reason for closed orders', () => {
    const order = orderFactory.build({
      macroState: 'cancelled',
      microState: 'cancelled',
      cancellationReason: 'Falta de estoque'
    });

    render(<OrderMetaCard order={order} />);

    expect(screen.getByText('Motivo do encerramento')).toBeInTheDocument();
    expect(screen.getByText('Falta de estoque')).toBeInTheDocument();
  });
});
