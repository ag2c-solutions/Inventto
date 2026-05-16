import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CatalogApi } from '../../data/api';
import type { Catalog } from '../../domain/entities';

import { CatalogService } from './index';

vi.mock('../../data/api', () => ({
  CatalogApi: {
    add: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
    checkSlugAvailability: vi.fn()
  }
}));

const mockCatalog: Catalog = {
  id: 'cat-1',
  name: 'Catálogo Teste',
  slug: 'teste',
  whatsappNumber: '551199999999',
  description: 'Desc',
  isActive: true,
  themeConfig: {
    colors: { primary: '#000000', background: '#ffffff' },
    branding: { showCover: false },
    layout: { mode: 'grid', productsPerPage: 10 },
    behavior: { displayPrice: true, whatsappMessage: 'Olá' }
  },
  createdAt: new Date()
};

describe('CatalogService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('add', () => {
    it('should delegate to CatalogApi.add with correct payload', async () => {
      vi.mocked(CatalogApi.add).mockResolvedValue(mockCatalog);

      const payload = {
        organizationId: 'org-1',
        name: 'Novo',
        slug: 'novo',
        whatsappNumber: '123',
        themeConfig: {
          colors: { primary: '#000000', background: '#ffffff' },
          branding: { showCover: false },
          layout: { mode: 'grid' as const, productsPerPage: 10 },
          behavior: { displayPrice: true, whatsappMessage: 'Olá' }
        }
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
          organizationId: 'org-1',
          name: 'A',
          slug: 'ocupado',
          whatsappNumber: '1',
          themeConfig: {
            colors: { primary: '#000000', background: '#ffffff' },
            branding: { showCover: false },
            layout: { mode: 'grid', productsPerPage: 10 },
            behavior: { displayPrice: true, whatsappMessage: 'Olá' }
          }
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
