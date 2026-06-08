export type EmailTemplate = 'order_expiring' | 'member_added';

export interface SendEmailPayload {
  template: EmailTemplate;
  to: string;
  data?: Record<string, string | number>;
}

export interface SendEmailResult {
  id: string;
}

export interface SendEmailResponseDTO {
  id: string;
}
