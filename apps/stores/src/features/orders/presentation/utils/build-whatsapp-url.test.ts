import { describe, expect, it } from 'vitest';

import { orderFactory } from '../../tests/factories/order.factory';

import { buildWhatsAppUrl } from './build-whatsapp-url';

describe('buildWhatsAppUrl', () => {
  it('should build a wa.me link with the country code and a message', () => {
    const order = orderFactory.build({
      customerPhone: '(11) 98765-4321',
      customerName: 'Joana Silva',
      code: 'ABCD1234'
    });

    const url = buildWhatsAppUrl(order);

    expect(url).toBe(
      'https://wa.me/5511987654321?text=Ol%C3%A1%2C%20Joana%20Silva!%20Sobre%20o%20seu%20pedido%20ABCD1234...'
    );
  });

  it('should return undefined when the order has no customer phone', () => {
    const order = orderFactory.build({ customerPhone: undefined });

    expect(buildWhatsAppUrl(order)).toBeUndefined();
  });
});
