export const ORDER_CANCEL_REASONS = [
  'Falta de estoque',
  'Cliente solicitou',
  'Dados inválidos',
  'Área não atendida'
] as const;

export type OrderCancelReason = (typeof ORDER_CANCEL_REASONS)[number];

// RN086: motivo obrigatório (conjunto fixo do wireframe, p/ métricas do
// negócio) para habilitar o cancelamento. `cancellation_reason` continua
// texto livre no banco — cancel_order (PED-01) não mudou de assinatura —,
// a checagem do conjunto fica só na UI.
export function cancelReasonValidator(reason: string | undefined): boolean {
  return (
    !!reason && (ORDER_CANCEL_REASONS as readonly string[]).includes(reason)
  );
}
