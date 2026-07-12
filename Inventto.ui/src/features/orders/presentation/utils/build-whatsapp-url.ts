import type { Order } from '../../domain/entities';

// RN084/RF032: mensagem padrão do WhatsApp — a origem definitiva (storefront
// de origem, whatsapp_message de VIT-05) ainda não está ligada ao pedido;
// ver "Ponto de verificação" do PED-02.
export function buildWhatsAppUrl(order: Order): string | undefined {
  if (!order.customerPhone) return undefined;

  const digits = order.customerPhone.replace(/\D/g, '');
  const message = encodeURIComponent(
    `Olá, ${order.customerName ?? ''}! Sobre o seu pedido ${order.code}...`
  );

  return `https://wa.me/55${digits}?text=${message}`;
}
