import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { CategoryDTO } from '../dtos';

import { CategoryApi } from './index';

const { mockSupabase, mockSelect, mockOrder, mockOverrideTypes } = vi.hoisted(
  () => {
    const mockSelect = vi.fn();
    const mockOrder = vi.fn();
    const mockInsert = vi.fn();
    const mockSingle = vi.fn();
    const mockOverrideTypes = vi.fn();

    const queryBuilder = {
      select: mockSelect,
      order: mockOrder,
      insert: mockInsert,
      single: mockSingle,
      overrideTypes: mockOverrideTypes
    };

    mockSelect.mockReturnValue(queryBuilder);
    mockOrder.mockReturnValue(queryBuilder);
    mockInsert.mockReturnValue(queryBuilder);
    mockSingle.mockReturnValue(queryBuilder);

    return {
      mockSupabase: {
        from: vi.fn(() => queryBuilder)
      },
      mockSelect,
      mockOrder,
      mockInsert,
      mockSingle,
      mockOverrideTypes
    };
  }
);

vi.mock('@/infra/supabase', () => ({
  supabase: mockSupabase
}));

const mockCategoryDTO: CategoryDTO = { id: 'c1', name: 'Roupas' };

describe('CategoryApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ─── QUERIES ────────────────────────────────────────────────────────────────

  describe('getAll', () => {
    it('should query "categories" and return mapped domain objects', async () => {
      mockOverrideTypes.mockResolvedValue({
        data: [mockCategoryDTO],
        error: null
      });

      const result = await CategoryApi.getAll();

      expect(mockSupabase.from).toHaveBeenCalledWith('categories');
      expect(mockSelect).toHaveBeenCalledWith('id, name');
      expect(mockOrder).toHaveBeenCalledWith('name', { ascending: true });
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({ id: 'c1', name: 'Roupas' });
    });

    it('should return an empty array when data is null', async () => {
      mockOverrideTypes.mockResolvedValue({ data: null, error: null });

      const result = await CategoryApi.getAll();

      expect(result).toEqual([]);
    });

    it('should throw "Erro de conexão" for network errors', async () => {
      mockOverrideTypes.mockResolvedValue({
        data: null,
        error: { message: 'Network request failed', code: '' }
      });

      await expect(CategoryApi.getAll()).rejects.toThrow(
        'Erro de conexão. Verifique sua internet.'
      );
    });

    it('should throw generic error for other database failures', async () => {
      mockOverrideTypes.mockResolvedValue({
        data: null,
        error: { message: 'Unknown Error', code: '500' }
      });

      await expect(CategoryApi.getAll()).rejects.toThrow(
        'Não foi possível realizar a operação. Tente novamente.'
      );
    });
  });

  // ─── MUTATIONS ──────────────────────────────────────────────────────────────

  describe('add', () => {
    it('should insert with name + organization_id and return the created category', async () => {
      mockOverrideTypes.mockResolvedValue({
        data: mockCategoryDTO,
        error: null
      });

      const result = await CategoryApi.add({
        name: 'Roupas',
        organizationId: 'org-1'
      });

      const insertCall = vi.mocked(mockSupabase.from().insert).mock.calls[0][0];

      expect(insertCall).toMatchObject({
        name: 'Roupas',
        organization_id: 'org-1'
      });
      expect(result).toEqual({ id: 'c1', name: 'Roupas' });
    });

    it('should throw "Já existe uma categoria" for duplicate names (23505)', async () => {
      mockOverrideTypes.mockResolvedValue({
        data: null,
        error: {
          message: 'duplicate key value violates unique constraint',
          code: '23505'
        }
      });

      await expect(
        CategoryApi.add({ name: 'Duplicata', organizationId: 'org-1' })
      ).rejects.toThrow('Já existe uma categoria com este nome.');
    });

    it('should throw generic error for other failures', async () => {
      mockOverrideTypes.mockResolvedValue({
        data: null,
        error: { message: 'Unknown Error', code: '500' }
      });

      await expect(
        CategoryApi.add({ name: 'Erro', organizationId: 'org-1' })
      ).rejects.toThrow(
        'Não foi possível realizar a operação. Tente novamente.'
      );
    });

    it('should throw "Categoria não retornada" when data is null without error', async () => {
      mockOverrideTypes.mockResolvedValue({ data: null, error: null });

      await expect(
        CategoryApi.add({ name: 'Sem retorno', organizationId: 'org-1' })
      ).rejects.toThrow('Erro inesperado: Categoria não retornada.');
    });
  });
});
