export function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!domain) return email;
  if (local.length <= 1) return `•••@${domain}`;
  return `${local[0]}•••@${domain}`;
}
