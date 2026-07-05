export interface CreateUserMetadataDTO {
  full_name: string;
  company_name: string;
  company_document: string | null;
  business_area_code: string;
  terms_accepted_at: string;
  avatar_url?: string;
}

export interface SignInPayload {
  email: string;
  password: string;
}

export interface SignUpPayload {
  companyName: string;
  document?: string;
  fullName: string;
  email: string;
  password: string;
  businessAreaCode: string;
  acceptedTerms: true;
}

export interface VerifyOtpPayload {
  email: string;
  token: string;
}

export interface ResendOtpPayload {
  email: string;
}

export interface RecoverPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  newPassword: string;
}

export interface SignUpFirstAccessPayload {
  email: string;
}

export interface ConfirmFirstAccessPayload {
  userId: string;
  orgId: string;
}
