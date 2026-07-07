import { faker } from '@faker-js/faker';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CatalogApi } from '../../data/api';
import {
  catalogFactory,
  createCatalogPayloadFactory
} from '../../tests/factories/catalog.factory';
import { catalogItemFactory } from '../../tests/factories/catalog-item.factory';

import { CatalogItemService, CatalogService } from './index';

vi.mock('../../data/api', () => ({
  CatalogApi: {
    add: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
    getItems: vi.fn(),
    addItems: vi.fn(),
    updateItemPrice: vi.fn(),
    removeItem: vi.fn(),
    restoreItem: vi.fn()
  }
}));

describe('CatalogService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('create', () => {
    it('should delegate to CatalogApi.add with correct payload', async () => {
      const payload = createCatalogPayloadFactory.build();
      const createdCatalog = catalogFactory.build({ name: payload.name });
      vi.mocked(CatalogApi.add).mockResolvedValue(createdCatalog);

      const result = await CatalogService.create(payload);

      expect(CatalogApi.add).toHaveBeenCalledWith(payload);
      expect(result).toEqual(createdCatalog);
    });

    it('should reject when name is empty without calling the API', async () => {
      await expect(
        CatalogService.create(createCatalogPayloadFactory.build({ name: '  ' }))
      ).rejects.toThrow('Informe um nome para o catálogo.');

      expect(CatalogApi.add).not.toHaveBeenCalled();
    });

    it('should propagate errors thrown by CatalogApi.add', async () => {
      vi.mocked(CatalogApi.add).mockRejectedValue(
        new Error('Já existe um catálogo com estes dados.')
      );

      await expect(
        CatalogService.create(createCatalogPayloadFactory.build())
      ).rejects.toThrow('Já existe um catálogo com estes dados.');
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

    it('should reject when name is provided but empty', async () => {
      await expect(
        CatalogService.update({ id: faker.string.uuid(), name: '   ' })
      ).rejects.toThrow('Informe um nome para o catálogo.');

      expect(CatalogApi.update).not.toHaveBeenCalled();
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
});

describe('CatalogItemService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getItems', () => {
    it('should delegate to CatalogApi.getItems', async () => {
      const items = catalogItemFactory.buildList(2);
      vi.mocked(CatalogApi.getItems).mockResolvedValue(items);

      const result = await CatalogItemService.getItems('cat-1');

      expect(CatalogApi.getItems).toHaveBeenCalledWith('cat-1');
      expect(result).toEqual(items);
    });
  });

  describe('addItems', () => {
    it('should delegate to CatalogApi.addItems when at least one product is selected', async () => {
      const items = catalogItemFactory.buildList(2);
      vi.mocked(CatalogApi.addItems).mockResolvedValue(items);

      const payload = { catalogId: 'cat-1', productIds: ['p1', 'p2'] };
      const result = await CatalogItemService.addItems(payload);

      expect(CatalogApi.addItems).toHaveBeenCalledWith(payload);
      expect(result).toEqual(items);
    });

    it('should reject without calling the API when no product is selected', async () => {
      await expect(
        CatalogItemService.addItems({ catalogId: 'cat-1', productIds: [] })
      ).rejects.toThrow('Selecione ao menos um produto.');

      expect(CatalogApi.addItems).not.toHaveBeenCalled();
    });
  });

  describe('updateItemPrice', () => {
    it('should delegate to CatalogApi.updateItemPrice for a positive price', async () => {
      const item = catalogItemFactory.build({ price: 99.9 });
      vi.mocked(CatalogApi.updateItemPrice).mockResolvedValue(item);

      const payload = { id: item.id, price: 99.9 };
      const result = await CatalogItemService.updateItemPrice(payload);

      expect(CatalogApi.updateItemPrice).toHaveBeenCalledWith(payload);
      expect(result).toEqual(item);
    });

    it('should reject a missing price (RN063) without calling the API', async () => {
      await expect(
        CatalogItemService.updateItemPrice({ id: 'item-1', price: 0 })
      ).rejects.toThrow('Defina um preço para incluir este item.');

      expect(CatalogApi.updateItemPrice).not.toHaveBeenCalled();
    });

    it('should reject a negative price without calling the API', async () => {
      await expect(
        CatalogItemService.updateItemPrice({ id: 'item-1', price: -10 })
      ).rejects.toThrow('Defina um preço para incluir este item.');

      expect(CatalogApi.updateItemPrice).not.toHaveBeenCalled();
    });

    it('should reject a non-positive original price without calling the API', async () => {
      await expect(
        CatalogItemService.updateItemPrice({
          id: 'item-1',
          price: 50,
          originalPrice: 0
        })
      ).rejects.toThrow('O preço original deve ser maior que zero.');

      expect(CatalogApi.updateItemPrice).not.toHaveBeenCalled();
    });
  });

  describe('removeItem', () => {
    it('should delegate to CatalogApi.removeItem', async () => {
      vi.mocked(CatalogApi.removeItem).mockResolvedValue(undefined);

      await CatalogItemService.removeItem('item-1');

      expect(CatalogApi.removeItem).toHaveBeenCalledWith('item-1');
    });
  });

  describe('restoreItem', () => {
    it('should delegate to CatalogApi.restoreItem', async () => {
      const item = catalogItemFactory.build();
      vi.mocked(CatalogApi.restoreItem).mockResolvedValue(item);

      const result = await CatalogItemService.restoreItem(item);

      expect(CatalogApi.restoreItem).toHaveBeenCalledWith(item);
      expect(result).toEqual(item);
    });
  });
});
