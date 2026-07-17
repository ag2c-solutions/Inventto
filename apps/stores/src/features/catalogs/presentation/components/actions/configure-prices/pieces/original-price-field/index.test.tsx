import { fireEvent, render, screen } from '@testing-library/react';
import { useForm } from 'react-hook-form';
import { describe, expect, it } from 'vitest';

import type { ConfigurePricesFormValues } from '@/features/catalogs/domain/validators';

import { OriginalPriceField } from './index';

describe('OriginalPriceField', () => {
  const TestWrapper = ({
    defaultOriginalPrice
  }: {
    defaultOriginalPrice?: number | null;
  }) => {
    const form = useForm<ConfigurePricesFormValues>({
      defaultValues: {
        items: [
          {
            productId: 'p1',
            priceMode: 'single',
            originalPrice: defaultOriginalPrice
          }
        ]
      }
    });

    return <OriginalPriceField name="items.0.originalPrice" form={form} />;
  };

  it('should render the "Adicionar promoção" button if originalPrice is null', () => {
    render(<TestWrapper defaultOriginalPrice={null} />);
    expect(
      screen.getByRole('button', { name: /Adicionar promoção/i })
    ).toBeInTheDocument();
  });

  it('should render the input field if originalPrice has a value', () => {
    render(<TestWrapper defaultOriginalPrice={1500} />);
    const input = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue('15,00');
  });

  it('should switch to input field when "Adicionar promoção" is clicked', async () => {
    render(<TestWrapper defaultOriginalPrice={null} />);

    const addBtn = screen.getByRole('button', { name: /Adicionar promoção/i });

    fireEvent.click(addBtn);

    const input = await screen.findByRole('textbox');

    expect(input).toBeInTheDocument();
    expect(input).toHaveValue('0,00');
  });

  it('should call remove when "Remover" button is clicked', async () => {
    render(<TestWrapper defaultOriginalPrice={1500} />);

    const removeBtn = screen.getByRole('button', { name: /Remover/i });

    fireEvent.click(removeBtn);

    const addBtn = await screen.findByRole('button', {
      name: /Adicionar promoção/i
    });

    expect(addBtn).toBeInTheDocument();
  });
});
