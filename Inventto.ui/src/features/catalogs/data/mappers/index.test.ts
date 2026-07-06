import { describe, expect, it } from 'vitest';

import { catalogDTOFactory } from '../../tests/factories/catalog.factory';

import { CatalogMapper } from './index';

describe('CatalogMapper', () => {
  describe('toDomain', () => {
    it('should map a DTO to the channel-agnostic domain model', () => {
      const dto = catalogDTOFactory.build({
        catalog_items: [{ count: 5 }]
      });

      const result = CatalogMapper.toDomain(dto);

      expect(result).toEqual({
        id: dto.id,
        organizationId: dto.organization_id,
        name: dto.name,
        createdAt: new Date(dto.created_at),
        updatedAt: new Date(dto.updated_at),
        productsCount: 5,
        channelsCount: 0
      });
    });

    it('should default productsCount to 0 when catalog_items is empty', () => {
      const dto = catalogDTOFactory.build({ catalog_items: [] });

      const result = CatalogMapper.toDomain(dto);

      expect(result.productsCount).toBe(0);
    });
  });

  describe('toPersistence', () => {
    it('should convert camelCase payload to snake_case DTO', () => {
      const result = CatalogMapper.toPersistence({
        organizationId: 'org-1',
        name: 'Catálogo Verão'
      });

      expect(result).toEqual({
        organization_id: 'org-1',
        name: 'Catálogo Verão'
      });
    });

    it('should omit fields that are not provided', () => {
      const result = CatalogMapper.toPersistence({ name: 'Só nome' });

      expect(result.name).toBe('Só nome');
      expect(result.organization_id).toBeUndefined();
    });
  });
});
