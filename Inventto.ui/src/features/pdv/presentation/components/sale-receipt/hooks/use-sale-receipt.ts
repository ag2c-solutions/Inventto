import { useState } from 'react';

import type { ConfirmedSale } from '../../../../domain/entities';
import { generateReceiptPdf } from '../../../utils/generate-receipt-pdf';

function buildFileName(sale: ConfirmedSale) {
  return `recibo-venda-${sale.orderId.slice(0, 8)}.pdf`;
}

function triggerDownload(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  // tabIndex=-1 evita que o clique programático mova o foco do browser para
  // o <a> — sem isso, o FocusScope do Radix Dialog interpreta o foco
  // "escapando" da Sheet como uma interação externa e fecha a Sheet junto
  // com o download.
  link.tabIndex = -1;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function useSaleReceipt(sale: ConfirmedSale) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  async function handleDownload() {
    setIsDownloading(true);
    try {
      const blob = await generateReceiptPdf(sale);
      triggerDownload(blob, buildFileName(sale));
    } finally {
      setIsDownloading(false);
    }
  }

  async function handleShare() {
    setIsSharing(true);
    try {
      const blob = await generateReceiptPdf(sale);
      const fileName = buildFileName(sale);
      const file = new File([blob], fileName, { type: 'application/pdf' });

      const canShareFile =
        typeof navigator.share === 'function' &&
        typeof navigator.canShare === 'function' &&
        navigator.canShare({ files: [file] });

      if (canShareFile) {
        try {
          await navigator.share({ files: [file], title: 'Recibo de venda' });
          return;
        } catch (error) {
          // Usuário cancelou o compartilhamento — não é um erro, não cai no fallback.
          const name = (error as { name?: string } | null)?.name;
          if (name === 'AbortError') return;
        }
      }

      triggerDownload(blob, fileName);
    } finally {
      setIsSharing(false);
    }
  }

  return { isDownloading, isSharing, handleDownload, handleShare };
}
