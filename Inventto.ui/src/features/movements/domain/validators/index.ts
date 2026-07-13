export const SALE_CANCEL_REASONS = [
  'Cliente desistiu da compra',
  'Produto com defeito ou avariado',
  'Erro no registro da venda',
  'Venda duplicada',
  'Pagamento não aprovado / estornado pela operadora',
  'Outro'
] as const;

export type SaleCancelReason = (typeof SALE_CANCEL_REASONS)[number];

// MOV-06: motivo obrigatório vindo de um conjunto fixo (pedido do usuário —
// texto livre inviabilizava análise de casos de devolução). O banco reforça
// isso com um enum de verdade (orders.cancellation_reason, ver migration
// 16_order_cancellation_reason_enum.sql) — a checagem aqui é só a primeira
// barreira (UI).
export function saleCancelReasonValidator(reason: string | undefined): boolean {
  return (
    !!reason && (SALE_CANCEL_REASONS as readonly string[]).includes(reason)
  );
}
