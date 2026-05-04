export interface CreateUserMetadataDTO {
  full_name: string;
  company_name: string;
  company_document: string | null;
  company_slug: string;
  avatar_url?: string;
}

export interface SignInPayload {
  email: string;
  password: string;
}

export interface SignUpPayload {
  companyName: string;
  document?: string;
  slug?: string;
  fullName: string;
  role?: string;
  email: string;
  password: string;
}
