import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { orderFactory } from '../../../tests/factories/order.factory';

import { OrderDeliveryCard } from './index';

describe('OrderDeliveryCard', () => {
  it('should render the structured address', () => {
    const order = orderFactory.build({
      address: {
        street: 'Av. Paulista',
        number: '1578',
        neighborhood: 'Bela Vista',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01310-100',
        complement: 'Apto 92'
      }
    });

    render(<OrderDeliveryCard order={order} />);

    expect(screen.getByText('Av. Paulista, 1578')).toBeInTheDocument();
    expect(screen.getByText('Bela Vista · São Paulo · SP')).toBeInTheDocument();
    expect(screen.getByText('CEP 01310-100')).toBeInTheDocument();
    expect(screen.getByText('Apto 92')).toBeInTheDocument();
  });

  it('should show the immutable snapshot tag (RN083)', () => {
    const order = orderFactory.build({
      address: { street: 'Rua A', number: '1' }
    });

    render(<OrderDeliveryCard order={order} />);

    expect(
      screen.getByText('Snapshot no momento do pedido · RN083')
    ).toBeInTheDocument();
  });

  it('should show a fallback when there is no address', () => {
    const order = orderFactory.build({ address: undefined });

    render(<OrderDeliveryCard order={order} />);

    expect(screen.getByText('Endereço não informado.')).toBeInTheDocument();
  });
});
