import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { formatIntegerToDecimal } from '@/shared/utils';
import { formatCurrency } from '@/shared/utils/formatters/format-currency';

import { cartItemFactory } from '../../tests/factories/cart-item.factory';
import { confirmedSaleFactory } from '../../tests/factories/confirmed-sale.factory';

const money = (cents: number) => formatCurrency(formatIntegerToDecimal(cents));

const {
  mockOutput,
  mockText,
  mockLine,
  mockAddFont,
  mockAddFileToVFS,
  mockAddImage,
  mockGetImageProperties
} = vi.hoisted(() => ({
  mockOutput: vi.fn(() => new Blob(['pdf'], { type: 'application/pdf' })),
  mockText: vi.fn(),
  mockLine: vi.fn(),
  mockAddFont: vi.fn(),
  mockAddFileToVFS: vi.fn(),
  mockAddImage: vi.fn(),
  mockGetImageProperties: vi.fn(() => ({
    width: 100,
    height: 60,
    fileType: 'PNG'
  }))
}));

vi.mock('jspdf', () => ({
  jsPDF: vi.fn().mockImplementation(function MockJsPDF(this: object) {
    Object.assign(this, {
      internal: { pageSize: { getWidth: () => 210, getHeight: () => 297 } },
      setFont: vi.fn(),
      setFontSize: vi.fn(),
      setTextColor: vi.fn(),
      setDrawColor: vi.fn(),
      setLineWidth: vi.fn(),
      text: mockText,
      line: mockLine,
      addPage: vi.fn(),
      addFont: mockAddFont,
      addFileToVFS: mockAddFileToVFS,
      addImage: mockAddImage,
      getImageProperties: mockGetImageProperties,
      output: mockOutput
    });
  })
}));

import { generateReceiptPdf } from './generate-receipt-pdf';

function stubFetch(overrides: { fontsOk?: boolean; logoOk?: boolean } = {}) {
  const { fontsOk = true, logoOk = true } = overrides;

  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string) => {
      const isLogo = url.includes('logo');
      const ok = isLogo ? logoOk : fontsOk;

      if (!ok) return { ok: false } as Response;

      return {
        ok: true,
        arrayBuffer: async () => new ArrayBuffer(8),
        blob: async () => new Blob(['fake'], { type: 'image/png' })
      } as unknown as Response;
    })
  );
}

describe('generateReceiptPdf', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    stubFetch();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should write the organization name, each item and the total into the document', async () => {
    const sale = confirmedSaleFactory.build({
      organizationName: 'Loja Física',
      items: [
        cartItemFactory.build({
          name: 'Cadeira Ergo',
          unitPrice: 5000,
          discount: 0,
          quantity: 2
        })
      ],
      subtotal: 10000,
      discountTotal: 0,
      total: 10000,
      paymentMethod: 'cash',
      amountPaid: 15000,
      changeAmount: 5000
    });

    await generateReceiptPdf(sale);

    const writtenTexts = mockText.mock.calls.map((call) => call[0]);

    expect(writtenTexts).toContain('RECIBO');
    expect(writtenTexts).toContain('Loja Física');
    expect(writtenTexts).toContain('Cadeira Ergo');
    expect(writtenTexts).toContain(money(10000));
    expect(writtenTexts).toContain('Dinheiro');
    expect(writtenTexts).toContain(money(15000));
    expect(writtenTexts).toContain(money(5000));
    expect(writtenTexts).toContain('Obrigado');
  });

  it('should write the variant label on its own line, separate from the product name', async () => {
    const sale = confirmedSaleFactory.build({
      items: [
        cartItemFactory.build({
          name: 'Ergo Chair 1',
          variantLabel: 'Midnight / Standard',
          unitPrice: 25000,
          discount: 0,
          quantity: 1
        })
      ]
    });

    await generateReceiptPdf(sale);

    const writtenTexts = mockText.mock.calls.map((call) => call[0]);

    expect(writtenTexts).toContain('Ergo Chair 1');
    expect(writtenTexts).toContain('Midnight / Standard');
    expect(writtenTexts.some((t) => t.includes('Ergo Chair 1 ('))).toBe(false);
  });

  it('should show the resolved display name for the customer, not the phone', async () => {
    const sale = confirmedSaleFactory.build({
      customer: { phone: '21982794006', displayName: 'Maria Souza' }
    });

    await generateReceiptPdf(sale);

    const writtenTexts = mockText.mock.calls.map((call) => call[0]);

    expect(writtenTexts).toContain('Maria Souza');
    expect(writtenTexts).not.toContain('21982794006');
  });

  it('should embed the organization logo when a logo url is present', async () => {
    const sale = confirmedSaleFactory.build({
      organizationLogoUrl: 'https://example.com/logo.png'
    });

    await generateReceiptPdf(sale);

    expect(mockGetImageProperties).toHaveBeenCalled();
    expect(mockAddImage).toHaveBeenCalled();
  });

  it('should skip the logo silently when it fails to load', async () => {
    stubFetch({ logoOk: false });
    const sale = confirmedSaleFactory.build({
      organizationLogoUrl: 'https://example.com/logo.png'
    });

    await expect(generateReceiptPdf(sale)).resolves.toBeInstanceOf(Blob);
    expect(mockAddImage).not.toHaveBeenCalled();
  });

  it('should embed the custom fonts when they load successfully', async () => {
    await generateReceiptPdf(confirmedSaleFactory.build());

    expect(mockAddFileToVFS).toHaveBeenCalledWith(
      'Poppins-Regular.ttf',
      expect.any(String)
    );
    expect(mockAddFont).toHaveBeenCalledWith(
      'Caveat-Variable.ttf',
      'Caveat',
      'normal'
    );
  });

  it('should fall back to the built-in fonts when the custom fonts fail to load', async () => {
    stubFetch({ fontsOk: false });

    await expect(
      generateReceiptPdf(confirmedSaleFactory.build())
    ).resolves.toBeInstanceOf(Blob);
    expect(mockAddFileToVFS).not.toHaveBeenCalled();
  });

  it('should return the blob produced by the pdf document', async () => {
    const blob = await generateReceiptPdf(confirmedSaleFactory.build());

    expect(mockOutput).toHaveBeenCalledWith('blob');
    expect(blob).toBeInstanceOf(Blob);
  });

  it('should not write change when payment method is not cash', async () => {
    const sale = confirmedSaleFactory.build({
      paymentMethod: 'card',
      amountPaid: undefined,
      changeAmount: undefined
    });

    await generateReceiptPdf(sale);

    const writtenTexts = mockText.mock.calls.map((call) => call[0]);

    expect(writtenTexts).toContain('Cartão');
    expect(writtenTexts).not.toContain('Valor recebido');
    expect(writtenTexts).not.toContain('Troco');
  });
});
