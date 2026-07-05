import { faker } from '@faker-js/faker';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CatalogApi } from '../../data/api';
import {
  catalogFactory,
  createCatalogPayloadFactory
} from '../../tests/factories/catalog.factory';

import { CatalogService } from './index';

vi.mock('../../data/api', () => ({
  CatalogApi: {
    add: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
    checkSlugAvailability: vi.fn()
  }
}));

describe('CatalogService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('add', () => {
    it('should delegate to CatalogApi.add with correct payload', async () => {
      const payload = createCatalogPayloadFactory.build();
      const createdCatalog = catalogFactory.build({ name: payload.name });
      vi.mocked(CatalogApi.add).mockResolvedValue(createdCatalog);

      const result = await CatalogService.add(payload);

      expect(CatalogApi.add).toHaveBeenCalledWith(payload);
      expect(result).toEqual(createdCatalog);
    });

    it('should propagate errors thrown by CatalogApi.add', async () => {
      vi.mocked(CatalogApi.add).mockRejectedValue(
        new Error(
          'Este link personalizado já está em uso. Por favor, escolha outro.'
        )
      );

      await expect(
        CatalogService.add(createCatalogPayloadFactory.build())
      ).rejects.toThrow('Este link personalizado já está em uso.');
    });
  });

  describe('update', () => {
    it('should delegate to CatalogApi.update with correct payload', async () => {
      const catalog = catalogFactory.build();
      vi.mocked(CatalogApi.update).mockResolvedValue({
        ...catalog,
        name: 'Editado'
      });

      const payload = { id: catalog.id, name: 'Editado' };
      const result = await CatalogService.update(payload);

      expect(CatalogApi.update).toHaveBeenCalledWith(payload);
      expect(result.name).toBe('Editado');
    });

    it('should propagate errors thrown by CatalogApi.update', async () => {
      vi.mocked(CatalogApi.update).mockRejectedValue(
        new Error('Ocorreu um erro inesperado ao processar o catálogo.')
      );

      await expect(
        CatalogService.update({ id: faker.string.uuid(), name: 'Fail' })
      ).rejects.toThrow('Ocorreu um erro inesperado');
    });
  });

  describe('remove', () => {
    it('should delegate to CatalogApi.remove with correct id', async () => {
      const catalogId = faker.string.uuid();
      vi.mocked(CatalogApi.remove).mockResolvedValue(undefined);

      await CatalogService.remove(catalogId);

      expect(CatalogApi.remove).toHaveBeenCalledWith(catalogId);
    });

    it('should propagate errors thrown by CatalogApi.remove', async () => {
      vi.mocked(CatalogApi.remove).mockRejectedValue(
        new Error('Ocorreu um erro inesperado ao processar o catálogo.')
      );

      await expect(CatalogService.remove(faker.string.uuid())).rejects.toThrow(
        'Ocorreu um erro inesperado'
      );
    });
  });

  describe('checkSlugAvailability', () => {
    it('should return true when slug is available', async () => {
      vi.mocked(CatalogApi.checkSlugAvailability).mockResolvedValue(true);

      const result = await CatalogService.checkSlugAvailability('livre');

      expect(CatalogApi.checkSlugAvailability).toHaveBeenCalledWith('livre');
      expect(result).toBe(true);
    });

    it('should return false when slug is taken', async () => {
      vi.mocked(CatalogApi.checkSlugAvailability).mockResolvedValue(false);

      const result = await CatalogService.checkSlugAvailability('ocupado');

      expect(CatalogApi.checkSlugAvailability).toHaveBeenCalledWith('ocupado');
      expect(result).toBe(false);
    });

    it('should return false without querying when slug is empty', async () => {
      const result = await CatalogService.checkSlugAvailability('   ');

      expect(result).toBe(false);
      expect(CatalogApi.checkSlugAvailability).not.toHaveBeenCalled();
    });

    it('should return false without querying when slug has fewer than 3 characters', async () => {
      const result = await CatalogService.checkSlugAvailability('ab');

      expect(result).toBe(false);
      expect(CatalogApi.checkSlugAvailability).not.toHaveBeenCalled();
    });

    it('should normalize the slug to lowercase and trimmed before querying', async () => {
      vi.mocked(CatalogApi.checkSlugAvailability).mockResolvedValue(true);

      await CatalogService.checkSlugAvailability('  Minha-Loja  ');

      expect(CatalogApi.checkSlugAvailability).toHaveBeenCalledWith(
        'minha-loja'
      );
    });
  });
});
