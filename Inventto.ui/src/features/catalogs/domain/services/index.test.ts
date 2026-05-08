import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CatalogApi } from '../../data/api';

import { CatalogService } from './index';

vi.mock('../../data/api', () => ({
  CatalogApi: {
    add: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
    checkSlugAvailability: vi.fn()
  }
}));

const mockCatalog = {
  id: 'cat-1',
  name: 'Catálogo Teste',
  slug: 'teste',
  whatsappNumber: '551199999999',
  description: 'Desc',
  isActive: true,
  themeConfig: {} as any,
  createdAt: new Date(),
  publicUrl: 'https://example.com/c/teste'
};

describe('CatalogService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('add', () => {
    it('should delegate to CatalogApi.add with correct payload', async () => {
      vi.mocked(CatalogApi.add).mockResolvedValue(mockCatalog);

      const payload = {
        name: 'Novo',
        slug: 'novo',
        whatsappNumber: '123',
        themeConfig: {} as any
      };

      const result = await CatalogService.add(payload);

      expect(CatalogApi.add).toHaveBeenCalledWith(payload);
      expect(result).toEqual(mockCatalog);
    });

    it('should propagate errors thrown by CatalogApi.add', async () => {
      vi.mocked(CatalogApi.add).mockRejectedValue(
        new Error(
          'Este link personalizado já está em uso. Por favor, escolha outro.'
        )
      );

      await expect(
        CatalogService.add({
          name: 'A',
          slug: 'ocupado',
          whatsappNumber: '1',
          themeConfig: {} as any
        })
      ).rejects.toThrow('Este link personalizado já está em uso.');
    });
  });

  describe('update', () => {
    it('should delegate to CatalogApi.update with correct payload', async () => {
      vi.mocked(CatalogApi.update).mockResolvedValue({
        ...mockCatalog,
        name: 'Editado'
      });

      const payload = { id: 'cat-1', name: 'Editado' };
      const result = await CatalogService.update(payload);

      expect(CatalogApi.update).toHaveBeenCalledWith(payload);
      expect(result.name).toBe('Editado');
    });

    it('should propagate errors thrown by CatalogApi.update', async () => {
      vi.mocked(CatalogApi.update).mockRejectedValue(
        new Error('Ocorreu um erro inesperado ao processar o catálogo.')
      );

      await expect(
        CatalogService.update({ id: 'cat-1', name: 'Fail' })
      ).rejects.toThrow('Ocorreu um erro inesperado');
    });
  });

  describe('remove', () => {
    it('should delegate to CatalogApi.remove with correct id', async () => {
      vi.mocked(CatalogApi.remove).mockResolvedValue(undefined);

      await CatalogService.remove('cat-1');

      expect(CatalogApi.remove).toHaveBeenCalledWith('cat-1');
    });

    it('should propagate errors thrown by CatalogApi.remove', async () => {
      vi.mocked(CatalogApi.remove).mockRejectedValue(
        new Error('Ocorreu um erro inesperado ao processar o catálogo.')
      );

      await expect(CatalogService.remove('cat-1')).rejects.toThrow(
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
  });
});
