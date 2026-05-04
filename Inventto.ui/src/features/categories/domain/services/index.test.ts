import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CategoryApi } from '../../data/api';

import { CategoryService } from './index';

vi.mock('../../data/api', () => ({
  CategoryApi: {
    add: vi.fn()
  }
}));

const mockCategory = { id: 'c1', name: 'Roupas' };

describe('CategoryService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('add', () => {
    it('should delegate to CategoryApi.add with correct payload', async () => {
      vi.mocked(CategoryApi.add).mockResolvedValue(mockCategory);

      const payload = { name: 'Roupas', organizationId: 'org-1' };
      const result = await CategoryService.add(payload);

      expect(CategoryApi.add).toHaveBeenCalledWith(payload);
      expect(result).toEqual(mockCategory);
    });

    it('should propagate errors thrown by CategoryApi.add', async () => {
      vi.mocked(CategoryApi.add).mockRejectedValue(
        new Error('Já existe uma categoria com este nome.')
      );

      await expect(
        CategoryService.add({ name: 'Duplicata', organizationId: 'org-1' })
      ).rejects.toThrow('Já existe uma categoria com este nome.');
    });
  });
});
