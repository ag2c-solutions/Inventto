import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Sheet } from '@/shared/components/ui/sheet';

import { confirmedSaleFactory } from '../../../tests/factories/confirmed-sale.factory';

import { SaleReceipt } from '.';

function renderReceipt(props: {
  sale: Parameters<typeof SaleReceipt>[0]['sale'];
  onNewSale: () => void;
}) {
  return render(
    <Sheet open>
      <SaleReceipt {...props} />
    </Sheet>
  );
}

const { mockGenerateReceiptPdf } = vi.hoisted(() => ({
  mockGenerateReceiptPdf: vi.fn()
}));

vi.mock('../../utils/generate-receipt-pdf', () => ({
  generateReceiptPdf: mockGenerateReceiptPdf
}));

describe('SaleReceipt', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    mockGenerateReceiptPdf.mockResolvedValue(
      new Blob(['pdf'], { type: 'application/pdf' })
    );
    globalThis.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
    globalThis.URL.revokeObjectURL = vi.fn();
  });

  it('should show the sale items, totals and payment method', () => {
    const sale = confirmedSaleFactory.build({
      paymentMethod: 'cash',
      amountPaid: 15000,
      changeAmount: 5000,
      total: 10000,
      subtotal: 10000,
      discountTotal: 0
    });

    renderReceipt({ sale, onNewSale: vi.fn() });

    expect(screen.getByText('Venda concluída')).toBeInTheDocument();
    expect(screen.getByText(sale.items[0].name)).toBeInTheDocument();
    expect(screen.getByText('Dinheiro')).toBeInTheDocument();
    expect(screen.getByText('Valor recebido')).toBeInTheDocument();
    expect(screen.getByText('Troco')).toBeInTheDocument();
  });

  it('should not show amount received or change for non-cash payments', () => {
    const sale = confirmedSaleFactory.build({
      paymentMethod: 'pix',
      amountPaid: undefined,
      changeAmount: undefined
    });

    renderReceipt({ sale, onNewSale: vi.fn() });

    expect(screen.getByText('Pix')).toBeInTheDocument();
    expect(screen.queryByText('Valor recebido')).not.toBeInTheDocument();
    expect(screen.queryByText('Troco')).not.toBeInTheDocument();
  });

  it('should generate and download the pdf when "Baixar PDF" is clicked', async () => {
    const sale = confirmedSaleFactory.build();

    renderReceipt({ sale, onNewSale: vi.fn() });

    await user.click(screen.getByRole('button', { name: /Baixar PDF/ }));

    expect(mockGenerateReceiptPdf).toHaveBeenCalledWith(sale);
    expect(globalThis.URL.createObjectURL).toHaveBeenCalled();
  });

  it('should call onNewSale when "Nova venda" is clicked', async () => {
    const onNewSale = vi.fn();
    const sale = confirmedSaleFactory.build();

    renderReceipt({ sale, onNewSale });

    await user.click(screen.getByRole('button', { name: 'Nova venda' }));

    expect(onNewSale).toHaveBeenCalled();
  });
});
