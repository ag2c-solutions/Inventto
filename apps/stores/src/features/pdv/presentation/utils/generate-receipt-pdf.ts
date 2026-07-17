import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { formatIntegerToDecimal } from '@/shared/utils';
import { formatCurrency } from '@/shared/utils/formatters/format-currency';

import type { ConfirmedSale } from '../../domain/entities';
import caveatFontUrl from '../assets/fonts/caveat-variable.ttf?url';
import poppinsBoldFontUrl from '../assets/fonts/poppins-bold.ttf?url';
import poppinsRegularFontUrl from '../assets/fonts/poppins-regular.ttf?url';
import { PAYMENT_METHOD_LABELS } from '../constants';

const MARGIN = 15;
const LINE_HEIGHT = 6;

// Paleta inspirada no modelo de referência (título/rótulos em navy, linhas
// de destaque em terracota).
const NAVY: [number, number, number] = [31, 58, 89];
const ACCENT: [number, number, number] = [176, 84, 68];
const GRAY: [number, number, number] = [110, 110, 110];
const BLACK: [number, number, number] = [30, 30, 30];

const BODY_FONT_FALLBACK = 'helvetica';
const SCRIPT_FONT_FALLBACK = 'times';

// formatCurrency retorna undefined para valores falsy (ex. 0) — o recibo
// sempre precisa de uma string para desenhar no PDF.
function money(cents: number): string {
  return formatCurrency(formatIntegerToDecimal(cents)) ?? 'R$ 0,00';
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

// Fontes/logo são recursos externos opcionais — se a rede falhar (offline,
// CORS, etc.), o recibo ainda deve ser gerado com as fontes padrão do jsPDF.
async function fetchAsBase64(url: string): Promise<string | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    return arrayBufferToBase64(await response.arrayBuffer());
  } catch {
    return null;
  }
}

async function fetchAsDataUrl(url: string): Promise<string | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const blob = await response.blob();
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

// PDV-06: lib de PDF (e as fontes customizadas) carregadas sob demanda —
// nada disso entra no bundle inicial do PDV, só é buscado quando o
// vendedor gera um comprovante.
export async function generateReceiptPdf(sale: ConfirmedSale): Promise<Blob> {
  const [{ jsPDF }, poppinsRegular, poppinsBold, caveat, logoDataUrl] =
    await Promise.all([
      import('jspdf'),
      fetchAsBase64(poppinsRegularFontUrl),
      fetchAsBase64(poppinsBoldFontUrl),
      fetchAsBase64(caveatFontUrl),
      sale.organizationLogoUrl
        ? fetchAsDataUrl(sale.organizationLogoUrl)
        : Promise.resolve(null)
    ]);

  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const contentRight = pageWidth - MARGIN;

  let bodyFont = BODY_FONT_FALLBACK;
  if (poppinsRegular && poppinsBold) {
    doc.addFileToVFS('Poppins-Regular.ttf', poppinsRegular);
    doc.addFont('Poppins-Regular.ttf', 'Poppins', 'normal');
    doc.addFileToVFS('Poppins-Bold.ttf', poppinsBold);
    doc.addFont('Poppins-Bold.ttf', 'Poppins', 'bold');
    bodyFont = 'Poppins';
  }

  let scriptFont = SCRIPT_FONT_FALLBACK;
  if (caveat) {
    doc.addFileToVFS('Caveat-Variable.ttf', caveat);
    doc.addFont('Caveat-Variable.ttf', 'Caveat', 'normal');
    scriptFont = 'Caveat';
  }

  let y = MARGIN;

  function ensureSpace(lines = 1) {
    if (y + lines * LINE_HEIGHT > pageHeight - MARGIN) {
      doc.addPage();
      y = MARGIN;
    }
  }

  function setColor(color: [number, number, number]) {
    doc.setTextColor(color[0], color[1], color[2]);
  }

  function text(
    value: string,
    x: number,
    options: {
      align?: 'left' | 'right' | 'center';
      bold?: boolean;
      size?: number;
      color?: [number, number, number];
      font?: string;
    } = {}
  ) {
    doc.setFont(options.font ?? bodyFont, options.bold ? 'bold' : 'normal');
    doc.setFontSize(options.size ?? 10);
    setColor(options.color ?? BLACK);
    doc.text(value, x, y, { align: options.align ?? 'left' });
  }

  function accentDivider(thickness = 0.8) {
    ensureSpace();
    doc.setDrawColor(ACCENT[0], ACCENT[1], ACCENT[2]);
    doc.setLineWidth(thickness);
    doc.line(MARGIN, y, contentRight, y);
    doc.setLineWidth(0.2);
    y += LINE_HEIGHT;
  }

  // Logo da loja, se houver — canto superior direito, acima dos metadados.
  const logoTop = MARGIN - 5;
  let logoBottom = logoTop;
  if (logoDataUrl) {
    try {
      const props = doc.getImageProperties(logoDataUrl);
      const maxWidth = 26;
      const maxHeight = 14;
      const ratio = props.width / props.height;
      let logoWidth = maxWidth;
      let logoHeight = logoWidth / ratio;
      if (logoHeight > maxHeight) {
        logoHeight = maxHeight;
        logoWidth = logoHeight * ratio;
      }
      doc.addImage(
        logoDataUrl,
        props.fileType,
        contentRight - logoWidth,
        logoTop,
        logoWidth,
        logoHeight
      );
      logoBottom = logoTop + logoHeight;
    } catch {
      // Imagem malformada/formato não suportado — segue sem logo.
    }
  }

  // Cabeçalho — título grande à esquerda.
  text('RECIBO', MARGIN, { bold: true, size: 28, color: NAVY });
  y += 12;

  // Vendedor (esquerda) / metadados do recibo (direita), lado a lado. Ambas
  // as colunas começam abaixo da logo (quando houver) pra não sobrepor.
  const metaStartY = Math.max(y, logoBottom + 4);
  y = metaStartY;
  text(sale.organizationName || 'Loja', MARGIN, { bold: true, size: 11 });
  y += LINE_HEIGHT;
  text('Venda no balcão', MARGIN, { size: 9, color: GRAY });

  y = metaStartY;
  const metaLabelX = 130;
  const metaValueX = contentRight;
  const metaRows: Array<[string, string]> = [
    ['RECIBO #', sale.orderId.slice(0, 8).toUpperCase()],
    [
      'DATA',
      format(sale.confirmedAt, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
    ],
    ['FORMA DE PAGAMENTO', PAYMENT_METHOD_LABELS[sale.paymentMethod]]
  ];
  metaRows.forEach(([label, value]) => {
    text(label, metaLabelX, { bold: true, size: 9, color: NAVY });
    text(value, metaValueX, { align: 'right', size: 9 });
    y += LINE_HEIGHT;
  });

  y = Math.max(y, metaStartY + LINE_HEIGHT * 2) + 4;

  // Cliente, quando houver.
  if (sale.customer) {
    const customerLabel =
      sale.customer.displayName ?? sale.customer.name ?? sale.customer.phone;

    text('CLIENTE', MARGIN, { bold: true, size: 9, color: NAVY });
    y += LINE_HEIGHT;
    text(customerLabel, MARGIN, { size: 10 });
    y += LINE_HEIGHT + 2;
  } else {
    y += 4;
  }

  accentDivider(1);
  y += 2;

  // Cabeçalho da tabela de itens.
  const colQty = MARGIN;
  const colDesc = MARGIN + 15;
  const colUnit = pageWidth - 70;
  const colTotal = contentRight;

  text('QTD', colQty, { bold: true, size: 9, color: NAVY });
  text('DESCRIÇÃO', colDesc, { bold: true, size: 9, color: NAVY });
  text('PREÇO UNIT.', colUnit, {
    bold: true,
    size: 9,
    color: NAVY,
    align: 'right'
  });
  text('VALOR', colTotal, {
    bold: true,
    size: 9,
    color: NAVY,
    align: 'right'
  });
  y += 3;
  accentDivider(0.4);
  y += 2;

  sale.items.forEach((item) => {
    ensureSpace(2);
    const unitFinal = item.unitPrice - item.discount;
    const lineTotal = unitFinal * item.quantity;

    // Nome na primeira linha; atributos da variante (se houver) na linha de
    // baixo — evita nomes longos colidindo com a coluna de preço.
    text(String(item.quantity), colQty, { size: 10 });
    text(item.name, colDesc, { size: 10 });
    text(money(unitFinal), colUnit, { size: 10, align: 'right' });
    text(money(lineTotal), colTotal, { size: 10, align: 'right' });
    y += LINE_HEIGHT - 1;

    if (item.variantLabel) {
      text(item.variantLabel, colDesc, { size: 8, color: GRAY });
      y += LINE_HEIGHT - 1;
    }

    y += 3;
  });

  y += 2;

  // Totais, alinhados à direita.
  const totalsLabelX = pageWidth - 70;
  function totalsRow(
    label: string,
    value: string,
    options: {
      bold?: boolean;
      size?: number;
      color?: [number, number, number];
    } = {}
  ) {
    ensureSpace();
    text(label, totalsLabelX, {
      size: options.size ?? 10,
      bold: options.bold,
      color: options.color ?? GRAY
    });
    text(value, contentRight, {
      align: 'right',
      size: options.size ?? 10,
      bold: options.bold,
      color: options.color ?? BLACK
    });
    y += LINE_HEIGHT;
  }

  totalsRow('Subtotal', money(sale.subtotal));

  if (sale.discountTotal > 0) {
    totalsRow('Descontos', `- ${money(sale.discountTotal)}`);
  }

  if (sale.paymentMethod === 'cash' && sale.amountPaid != null) {
    totalsRow('Valor recebido', money(sale.amountPaid));

    if (sale.changeAmount != null && sale.changeAmount > 0) {
      totalsRow('Troco', money(sale.changeAmount));
    }
  }

  y += 1;
  totalsRow('TOTAL', money(sale.total), { bold: true, size: 14, color: NAVY });

  y += 10;
  accentDivider(0.4);
  y += 8;

  text('Obrigado', MARGIN, {
    size: 26,
    color: NAVY,
    font: scriptFont
  });
  text('Recibo informal — não é documento fiscal.', contentRight, {
    align: 'right',
    size: 8,
    color: GRAY
  });

  return doc.output('blob');
}
