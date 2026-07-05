import type { SignUpPayload } from '../../domain/entities';
import type { CreateUserMetadataDTO } from '../dtos';

export class AuthMapper {
  static toSupabaseMetadata(payload: SignUpPayload): CreateUserMetadataDTO {
    return {
      full_name: payload.fullName,
      company_name: payload.companyName,
      company_document: payload.document || null,
      business_area_code: payload.businessAreaCode,
      terms_accepted_at: new Date().toISOString(),
      avatar_url: '' // Usuário não possui avatar no cadastro; definido posteriormente em configurações de perfil
    };
  }
}
