import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { PaymentSection } from './index';

describe('PaymentSection', () => {
  const user = userEvent.setup();

  globalThis.URL.createObjectURL = vi.fn(() => 'blob:mock-url');

  it('should report an invalid state until a payment method is chosen', () => {
    const onChange = vi.fn();

    render(<PaymentSection total={10000} onChange={onChange} />);

    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ method: null, isValid: false })
    );
    expect(screen.queryByLabelText('Valor recebido')).not.toBeInTheDocument();
    expect(screen.queryByText(/Anexar comprovante/)).not.toBeInTheDocument();
  });

  it('should show the amount-received field and mark valid when cash covers the total', async () => {
    const onChange = vi.fn();

    render(<PaymentSection total={10000} onChange={onChange} />);

    await user.click(screen.getByRole('button', { name: 'Dinheiro' }));

    const amountInput = screen.getByLabelText('Valor recebido');
    expect(amountInput).toBeInTheDocument();

    await user.type(amountInput, '15000');

    expect(screen.getByText(/Troco:/)).toBeInTheDocument();
    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        method: 'cash',
        amountPaid: 15000,
        isValid: true
      })
    );
  });

  it('should show an inline error and mark invalid when cash is insufficient', async () => {
    const onChange = vi.fn();

    render(<PaymentSection total={10000} onChange={onChange} />);

    await user.click(screen.getByRole('button', { name: 'Dinheiro' }));
    await user.type(screen.getByLabelText('Valor recebido'), '500');

    expect(
      screen.getByText('O valor recebido é menor que o total da venda.')
    ).toBeInTheDocument();
    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ isValid: false })
    );
  });

  it('should show the optional proof upload and mark valid when card is chosen', async () => {
    const onChange = vi.fn();

    render(<PaymentSection total={10000} onChange={onChange} />);

    await user.click(screen.getByRole('button', { name: 'Cartão' }));

    expect(
      screen.getByText('Anexar comprovante (opcional)')
    ).toBeInTheDocument();
    expect(screen.queryByLabelText('Valor recebido')).not.toBeInTheDocument();
    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ method: 'card', isValid: true })
    );
  });

  it('should show a preview with the file name after a proof is attached, and allow removing it', async () => {
    const onChange = vi.fn();

    render(<PaymentSection total={10000} onChange={onChange} />);

    await user.click(screen.getByRole('button', { name: 'Cartão' }));

    const file = new File(['proof'], 'comprovante.png', {
      type: 'image/png'
    });
    const input = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    await user.upload(input, file);

    expect(screen.getByText('comprovante.png')).toBeInTheDocument();
    expect(screen.getByAltText('comprovante.png')).toBeInTheDocument();
    expect(screen.queryByText('Anexar comprovante')).not.toBeInTheDocument();

    await user.click(
      screen.getByRole('button', { name: 'Remover comprovante' })
    );

    expect(screen.queryByText('comprovante.png')).not.toBeInTheDocument();
    expect(screen.getByText('Anexar comprovante')).toBeInTheDocument();
  });

  it('should show the optional proof upload for pix as well', async () => {
    const onChange = vi.fn();

    render(<PaymentSection total={10000} onChange={onChange} />);

    await user.click(screen.getByRole('button', { name: 'Pix' }));

    expect(
      screen.getByText('Anexar comprovante (opcional)')
    ).toBeInTheDocument();
    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ method: 'pix', isValid: true })
    );
  });
});
