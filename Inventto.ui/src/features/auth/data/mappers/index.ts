import type { CreateUserMetadataDTO, SignUpPayload } from '../dtos';

export class AuthMapper {
  static toSupabaseMetadata(payload: SignUpPayload): CreateUserMetadataDTO {
    return {
      full_name: payload.fullName,
      company_name: payload.companyName,
      company_document: payload.document || null,
      business_area_id: payload.businessAreaId,
      terms_accepted_at: new Date().toISOString(),
      avatar_url: '' // Usuário não possui avatar no cadastro; definido posteriormente em configurações de perfil
    };
  }
}
