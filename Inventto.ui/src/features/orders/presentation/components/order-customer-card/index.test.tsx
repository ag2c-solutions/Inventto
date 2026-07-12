import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { orderFactory } from '../../../tests/factories/order.factory';

import { OrderCustomerCard } from './index';

describe('OrderCustomerCard', () => {
  it('should render the customer name, phone and initials', () => {
    const order = orderFactory.build({
      customerName: 'Mariana Alves',
      customerPhone: '(11) 98765-4321'
    });

    render(<OrderCustomerCard order={order} />);

    expect(screen.getByText('Mariana Alves')).toBeInTheDocument();
    expect(screen.getByText('(11) 98765-4321')).toBeInTheDocument();
    expect(screen.getByText('MA')).toBeInTheDocument();
  });

  it('should link "Chamar no WhatsApp" to a wa.me url when the customer has a phone', () => {
    const order = orderFactory.build({
      customerName: 'Mariana Alves',
      customerPhone: '(11) 98765-4321'
    });

    render(<OrderCustomerCard order={order} />);

    const link = screen.getByRole('link', { name: /Chamar no WhatsApp/ });
    expect(link).toHaveAttribute(
      'href',
      expect.stringContaining('wa.me/5511987654321')
    );
  });

  it('should disable "Chamar no WhatsApp" when there is no phone', () => {
    const order = orderFactory.build({ customerPhone: undefined });

    render(<OrderCustomerCard order={order} />);

    expect(
      screen.getByRole('button', { name: /Chamar no WhatsApp/ })
    ).toBeDisabled();
  });

  it('should show a fallback label when the customer name is missing', () => {
    const order = orderFactory.build({ customerName: undefined });

    render(<OrderCustomerCard order={order} />);

    expect(screen.getByText('Cliente não identificado')).toBeInTheDocument();
  });
});
