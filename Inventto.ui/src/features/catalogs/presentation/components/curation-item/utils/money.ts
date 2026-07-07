export function parseMoneyInput(raw: string): number {
  const digits = raw.replace(/\D/g, '');
  const cents = digits ? Number.parseInt(digits, 10) : 0;

  return cents / 100;
}

export function formatMoneyInput(value: number | undefined): string {
  if (!value) return '';

  const cents = Math.round(value * 100);

  return (cents / 100).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}
