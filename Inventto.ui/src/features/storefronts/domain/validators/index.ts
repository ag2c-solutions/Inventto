// RN073-adjacent UI guard: confirmação de remoção por digitação do nome
// exato (tolerando espaços nas pontas) — a RPC não depende disso.
export function removeConfirmationValidator(
  confirmation: string,
  expectedName: string
): boolean {
  return confirmation.trim() === expectedName.trim();
}
