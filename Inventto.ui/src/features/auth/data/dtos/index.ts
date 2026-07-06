export interface CreateUserMetadataDTO {
  full_name: string;
  company_name: string;
  company_document: string | null;
  business_area_code: string;
  terms_accepted_at: string;
  avatar_url?: string;
}

export interface SignUpFirstAccessPayload {
  email: string;
}

export interface ConfirmFirstAccessPayload {
  userId: string;
  orgId: string;
}
