// Erro distinguível para conta pendente de verificação de e-mail.
// A UI usa este símbolo para cair no Passo 2 (OTP) sem mascarar como
// credencial inválida neutra (RN002 aplica-se apenas a senha errada).
export const EMAIL_NOT_CONFIRMED_ERROR = 'EMAIL_NOT_CONFIRMED';
