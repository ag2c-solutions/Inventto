import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CategoryApi } from '../../data/api';
import {
  categoryFactory,
  createCategoryPayloadFactory
} from '../../tests/factories/category.factory';

import { CategoryService } from './index';

vi.mock('../../data/api', () => ({
  CategoryApi: {
    add: vi.fn()
  }
}));

describe('CategoryService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('add', () => {
    it('should delegate to CategoryApi.add with correct payload', async () => {
      const payload = createCategoryPayloadFactory.build();
      const createdCategory = categoryFactory.build({ name: payload.name });
      vi.mocked(CategoryApi.add).mockResolvedValue(createdCategory);

      const result = await CategoryService.add(payload);

      expect(CategoryApi.add).toHaveBeenCalledWith(payload);
      expect(result).toEqual(createdCategory);
    });

    it('should propagate errors thrown by CategoryApi.add', async () => {
      vi.mocked(CategoryApi.add).mockRejectedValue(
        new Error('Já existe uma categoria com este nome.')
      );

      await expect(
        CategoryService.add(createCategoryPayloadFactory.build())
      ).rejects.toThrow('Já existe uma categoria com este nome.');
    });

    it('should throw when organizationId is empty', async () => {
      await expect(
        CategoryService.add(
          createCategoryPayloadFactory.build({ organizationId: '' })
        )
      ).rejects.toThrow('Nenhuma organização selecionada.');
    });

    it('should throw when organizationId is whitespace', async () => {
      await expect(
        CategoryService.add(
          createCategoryPayloadFactory.build({ organizationId: '   ' })
        )
      ).rejects.toThrow('Nenhuma organização selecionada.');
    });
  });
});
