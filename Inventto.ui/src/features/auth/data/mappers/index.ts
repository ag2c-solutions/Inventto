import type { CreateUserMetadataDTO, SignUpPayload } from '../dtos';

export class AuthMapper {
  static toSupabaseMetadata(payload: SignUpPayload): CreateUserMetadataDTO {
    return {
      full_name: payload.fullName,
      company_name: payload.companyName,
      company_document: payload.document || null,
      company_slug: payload.slug || '',
      avatar_url: ''
    };
  }
}
