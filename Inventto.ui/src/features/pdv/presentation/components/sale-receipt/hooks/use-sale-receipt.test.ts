import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { confirmedSaleFactory } from '../../../../tests/factories/confirmed-sale.factory';

const { mockGenerateReceiptPdf } = vi.hoisted(() => ({
  mockGenerateReceiptPdf: vi.fn()
}));

vi.mock('../../../utils/generate-receipt-pdf', () => ({
  generateReceiptPdf: mockGenerateReceiptPdf
}));

import { useSaleReceipt } from './use-sale-receipt';

// Cria um <a> real (o hook anexa/remove do DOM de verdade) mas substitui o
// `.click()` pra não navegar de fato — só a chamada é observada.
function spyOnAnchorCreation() {
  const originalCreateElement = document.createElement.bind(document);
  const clickSpy = vi.fn();

  const spy = vi
    .spyOn(document, 'createElement')
    .mockImplementation((tagName: string, options?: ElementCreationOptions) => {
      const element = originalCreateElement(tagName, options);
      if (tagName === 'a') {
        element.click = clickSpy;
      }
      return element;
    });

  return { clickSpy, spy };
}

describe('useSaleReceipt', () => {
  const sale = confirmedSaleFactory.build({ orderId: 'a1b2c3d4-order' });
  const blob = new Blob(['pdf'], { type: 'application/pdf' });

  beforeEach(() => {
    vi.clearAllMocks();
    mockGenerateReceiptPdf.mockResolvedValue(blob);
    globalThis.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
    globalThis.URL.revokeObjectURL = vi.fn();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('should generate the pdf and trigger a download', async () => {
    const { clickSpy } = spyOnAnchorCreation();

    const { result } = renderHook(() => useSaleReceipt(sale));

    await act(async () => {
      await result.current.handleDownload();
    });

    expect(mockGenerateReceiptPdf).toHaveBeenCalledWith(sale);
    expect(clickSpy).toHaveBeenCalled();
    expect(globalThis.URL.revokeObjectURL).toHaveBeenCalledWith(
      'blob:mock-url'
    );
  });

  it('should share the file via navigator.share when supported', async () => {
    const shareMock = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('navigator', {
      ...navigator,
      share: shareMock,
      canShare: vi.fn().mockReturnValue(true)
    });

    const { result } = renderHook(() => useSaleReceipt(sale));

    await act(async () => {
      await result.current.handleShare();
    });

    expect(shareMock).toHaveBeenCalledWith(
      expect.objectContaining({ files: expect.any(Array) })
    );
  });

  it('should fall back to download when navigator.share is not supported', async () => {
    vi.stubGlobal('navigator', { ...navigator, share: undefined });
    const { clickSpy } = spyOnAnchorCreation();

    const { result } = renderHook(() => useSaleReceipt(sale));

    await act(async () => {
      await result.current.handleShare();
    });

    expect(clickSpy).toHaveBeenCalled();
  });

  it('should silently stop when the user cancels the native share sheet', async () => {
    const abortError = new DOMException('cancelled', 'AbortError');
    const shareMock = vi.fn().mockRejectedValue(abortError);
    vi.stubGlobal('navigator', {
      ...navigator,
      share: shareMock,
      canShare: vi.fn().mockReturnValue(true)
    });
    const { clickSpy } = spyOnAnchorCreation();

    const { result } = renderHook(() => useSaleReceipt(sale));

    await act(async () => {
      await result.current.handleShare();
    });

    expect(clickSpy).not.toHaveBeenCalled();
  });

  it('should track loading state while downloading', async () => {
    let resolvePdf: (blob: Blob) => void = () => {};
    mockGenerateReceiptPdf.mockReturnValue(
      new Promise((resolve) => {
        resolvePdf = resolve;
      })
    );
    spyOnAnchorCreation();

    const { result } = renderHook(() => useSaleReceipt(sale));

    expect(result.current.isDownloading).toBe(false);

    let downloadPromise: Promise<void>;
    act(() => {
      downloadPromise = result.current.handleDownload();
    });

    await waitFor(() => expect(result.current.isDownloading).toBe(true));

    await act(async () => {
      resolvePdf(blob);
      await downloadPromise;
    });

    expect(result.current.isDownloading).toBe(false);
  });
});
