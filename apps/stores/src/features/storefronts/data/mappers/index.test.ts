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

    it('should map a fully populated theme', () => {
      const dto = storefrontDTOFactory.build({
        theme: {
          colors: {
            primary: '#111111',
            background: '#222222',
            secondary: '#333333',
            text: '#444444'
          },
          logo_url: 'https://cdn.test/logo.png',
          cover_url: 'https://cdn.test/cover.png',
          layout: 'list',
          card_style: 'minimal-large-image'
        }
      });

      const result = StorefrontMapper.toDomain(dto);

      expect(result.theme).toEqual({
        colors: {
          primary: '#111111',
          background: '#222222',
          secondary: '#333333',
          text: '#444444'
        },
        logoUrl: 'https://cdn.test/logo.png',
        coverUrl: 'https://cdn.test/cover.png',
        layout: 'list',
        cardStyle: 'minimal-large-image'
      });
    });

    it('should fall back to default theme values when theme is empty (pre-VIT-04 storefronts)', () => {
      const dto = storefrontDTOFactory.build();
      // fishery faz deep-merge de overrides — sobrescreve direto no objeto
      // pra simular o `theme = '{}'` (default do banco) sem herdar valores
      // gerados pela factory.
      dto.theme = {};

      const result = StorefrontMapper.toDomain(dto);

      expect(result.theme).toEqual({
        colors: {
          primary: '#3A3631',
          background: '#F7F5F2',
          secondary: '#8B857D',
          text: '#2C2A28'
        },
        logoUrl: undefined,
        coverUrl: undefined,
        layout: 'grid',
        cardStyle: 'minimal-large-image'
      });
    });

    it('should fall back to default colors only for missing individual keys', () => {
      const dto = storefrontDTOFactory.build({
        theme: { colors: { primary: '#ABCDEF' } }
      });

      const result = StorefrontMapper.toDomain(dto);

      expect(result.theme.colors.primary).toBe('#ABCDEF');
      expect(result.theme.colors.background).toBe('#F7F5F2');
    });
  });
});
