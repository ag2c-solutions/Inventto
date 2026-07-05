import { describe, expect, it } from 'vitest';

import { signUpPayloadFactory } from '../../tests/factories/auth.factory';

import { AuthMapper } from '.';

describe('Auth Mappers', () => {
  describe('toSupabaseMetadata', () => {
    it('should correctly map SignUpPayload to CreateUserMetadataDTO', () => {
      const payload = signUpPayloadFactory.build();

      const result = AuthMapper.toSupabaseMetadata(payload);

      expect(result.full_name).toBe(payload.fullName);
      expect(result.company_name).toBe(payload.companyName);
      expect(result.company_document).toBe(payload.document);
      expect(result.business_area_code).toBe(payload.businessAreaCode);
      expect(result.avatar_url).toBe('');
      // terms_accepted_at deve ser um timestamp ISO válido
      expect(() => new Date(result.terms_accepted_at)).not.toThrow();
      expect(new Date(result.terms_accepted_at).toISOString()).toBe(
        result.terms_accepted_at
      );
    });

    it('should not contain company_slug in the mapped metadata', () => {
      const payload = signUpPayloadFactory.build({
        businessAreaCode: 'petshop'
      });

      const result = AuthMapper.toSupabaseMetadata(payload);

      expect(result).not.toHaveProperty('company_slug');
      expect(result.business_area_code).toBe('petshop');
      expect(result.terms_accepted_at).toBeDefined();
    });

    it('should handle null document correctly', () => {
      const payload = signUpPayloadFactory.build({ document: undefined });

      const result = AuthMapper.toSupabaseMetadata(payload);

      expect(result.company_document).toBeNull();
    });
  });
});
