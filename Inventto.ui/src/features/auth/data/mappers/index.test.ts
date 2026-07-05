import { describe, expect, it } from 'vitest';

import type { SignUpPayload } from '../../domain/entities';

import { AuthMapper } from '.';

describe('Auth Mappers', () => {
  describe('toSupabaseMetadata', () => {
    it('should correctly map SignUpPayload to CreateUserMetadataDTO', () => {
      const payload: SignUpPayload = {
        fullName: 'John Doe',
        companyName: 'Acme Corp',
        email: 'john@acme.com',
        password: 'securePassword123!',
        document: '12345678900',
        businessAreaCode: 'clothing',
        acceptedTerms: true
      };

      const result = AuthMapper.toSupabaseMetadata(payload);

      expect(result.full_name).toBe('John Doe');
      expect(result.company_name).toBe('Acme Corp');
      expect(result.company_document).toBe('12345678900');
      expect(result.business_area_code).toBe('clothing');
      expect(result.avatar_url).toBe('');
      // terms_accepted_at deve ser um timestamp ISO válido
      expect(() => new Date(result.terms_accepted_at)).not.toThrow();
      expect(new Date(result.terms_accepted_at).toISOString()).toBe(
        result.terms_accepted_at
      );
    });

    it('should not contain company_slug in the mapped metadata', () => {
      const payload: SignUpPayload = {
        fullName: 'Jane Doe',
        companyName: 'Minha Empresa Legal',
        email: 'jane@company.com',
        password: 'Password1!',
        businessAreaCode: 'petshop',
        acceptedTerms: true
      };

      const result = AuthMapper.toSupabaseMetadata(payload);

      expect(result).not.toHaveProperty('company_slug');
      expect(result.business_area_code).toBe('petshop');
      expect(result.terms_accepted_at).toBeDefined();
    });

    it('should handle null document correctly', () => {
      const payload: SignUpPayload = {
        fullName: 'User Without Doc',
        companyName: 'No Doc Inc',
        email: 'nodoc@inc.com',
        password: 'Password1!',
        businessAreaCode: 'other',
        acceptedTerms: true
      };

      const result = AuthMapper.toSupabaseMetadata(payload);

      expect(result.company_document).toBeNull();
    });
  });
});
