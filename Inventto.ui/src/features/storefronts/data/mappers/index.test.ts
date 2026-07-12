import { describe, expect, it } from 'vitest';

import { storefrontDTOFactory } from '../../tests/factories/storefront.factory';

import { StorefrontMapper } from './index';

describe('StorefrontMapper', () => {
  describe('toDomain', () => {
    it('should map status="active" to state="live"', () => {
      const dto = storefrontDTOFactory.build({ status: 'active' });

      const result = StorefrontMapper.toDomain(dto);

      expect(result.state).toBe('live');
    });

    it('should map status="inactive" to state="inactive"', () => {
      const dto = storefrontDTOFactory.build({ status: 'inactive' });

      const result = StorefrontMapper.toDomain(dto);

      expect(result.state).toBe('inactive');
    });

    it('should compose publicUrl from the slug', () => {
      const dto = storefrontDTOFactory.build({ slug: 'atelie-joana' });

      const result = StorefrontMapper.toDomain(dto);

      expect(result.publicUrl).toBe('inventto.app/atelie-joana');
    });

    it('should leave publicUrl undefined when there is no slug', () => {
      const dto = storefrontDTOFactory.build({ slug: null });

      const result = StorefrontMapper.toDomain(dto);

      expect(result.publicUrl).toBeUndefined();
      expect(result.slug).toBeUndefined();
    });

    it('should map the linked catalog name when present', () => {
      const dto = storefrontDTOFactory.build({
        catalog_id: 'cat-1',
        catalog: { id: 'cat-1', name: 'Coleção Verão 2026' }
      });

      const result = StorefrontMapper.toDomain(dto);

      expect(result.catalogId).toBe('cat-1');
      expect(result.catalogName).toBe('Coleção Verão 2026');
    });

    it('should leave catalogId/catalogName undefined when there is no linked catalog', () => {
      const dto = storefrontDTOFactory.build({
        catalog_id: null,
        catalog: null
      });

      const result = StorefrontMapper.toDomain(dto);

      expect(result.catalogId).toBeUndefined();
      expect(result.catalogName).toBeUndefined();
    });

    it('should map the whatsapp number when present', () => {
      const dto = storefrontDTOFactory.build({ whatsapp: '11999998888' });

      const result = StorefrontMapper.toDomain(dto);

      expect(result.whatsapp).toBe('11999998888');
    });

    it('should leave whatsapp undefined when absent', () => {
      const dto = storefrontDTOFactory.build({ whatsapp: null });

      const result = StorefrontMapper.toDomain(dto);

      expect(result.whatsapp).toBeUndefined();
    });

    it('should map instagram/facebook/website when present', () => {
      const dto = storefrontDTOFactory.build({
        instagram: '@atelie.joana',
        facebook: '/atelie.joana',
        website: 'https://atelie.com'
      });

      const result = StorefrontMapper.toDomain(dto);

      expect(result.instagram).toBe('@atelie.joana');
      expect(result.facebook).toBe('/atelie.joana');
      expect(result.website).toBe('https://atelie.com');
    });

    it('should leave instagram/facebook/website undefined when absent', () => {
      const dto = storefrontDTOFactory.build({
        instagram: null,
        facebook: null,
        website: null
      });

      const result = StorefrontMapper.toDomain(dto);

      expect(result.instagram).toBeUndefined();
      expect(result.facebook).toBeUndefined();
      expect(result.website).toBeUndefined();
    });
  });
});
