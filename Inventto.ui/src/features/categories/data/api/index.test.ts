import { faker } from '@faker-js/faker';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  categoryDTOFactory,
  createCategoryPayloadFactory
} from '../../tests/factories/category.factory';

import { CategoryApi } from './index';

const { mockSupabase, mockSelect, mockOrder, mockOverrideTypes, mockEq } =
  vi.hoisted(() => {
    const mockSelect = vi.fn();
    const mockOrder = vi.fn();
    const mockInsert = vi.fn();
    const mockSingle = vi.fn();
    const mockOverrideTypes = vi.fn();
    const mockEq = vi.fn();

    const queryBuilder = {
      select: mockSelect,
      order: mockOrder,
      insert: mockInsert,
      single: mockSingle,
      overrideTypes: mockOverrideTypes,
      eq: mockEq
    };

    mockSelect.mockReturnValue(queryBuilder);
    mockOrder.mockReturnValue(queryBuilder);
    mockInsert.mockReturnValue(queryBuilder);
    mockSingle.mockReturnValue(queryBuilder);
    mockEq.mockReturnValue(queryBuilder);

    return {
      mockSupabase: {
        from: vi.fn(() => queryBuilder)
      },
      mockSelect,
      mockOrder,
      mockInsert,
      mockSingle,
      mockOverrideTypes,
      mockEq
    };
  });

vi.mock('@/infra/supabase', () => ({
  supabase: mockSupabase
}));

describe('CategoryApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ─── QUERIES ────────────────────────────────────────────────────────────────

  describe('getAll', () => {
    it('should query "categories" and return mapped domain objects', async () => {
      const dto = categoryDTOFactory.build();
      mockOverrideTypes.mockResolvedValue({
        data: [dto],
        error: null
      });

      const result = await CategoryApi.getAll(dto.organization_id!);

      expect(mockSupabase.from).toHaveBeenCalledWith('categories');
      expect(mockSelect).toHaveBeenCalledWith('id, name');
      expect(mockEq).toHaveBeenCalledWith(
        'organization_id',
        dto.organization_id
      );
      expect(mockOrder).toHaveBeenCalledWith('name', { ascending: true });
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({ id: dto.id, name: dto.name });
    });

    it('should return an empty array when data is null', async () => {
      mockOverrideTypes.mockResolvedValue({ data: null, error: null });

      const result = await CategoryApi.getAll(faker.string.uuid());

      expect(result).toEqual([]);
    });

    it('should throw "Erro de conexão" for network errors', async () => {
      mockOverrideTypes.mockResolvedValue({
        data: null,
        error: { message: 'Network request failed', code: '', details: null }
      });

      await expect(CategoryApi.getAll(faker.string.uuid())).rejects.toThrow(
        'Erro de conexão. Verifique sua internet.'
      );
    });

    it('should throw generic error for other database failures', async () => {
      mockOverrideTypes.mockResolvedValue({
        data: null,
        error: { message: 'Unknown Error', code: '500' }
      });

      await expect(CategoryApi.getAll(faker.string.uuid())).rejects.toThrow(
        'Não foi possível realizar a operação. Tente novamente.'
      );
    });
  });

  // ─── MUTATIONS ──────────────────────────────────────────────────────────────

  describe('add', () => {
    it('should insert with name + organization_id and return the created category', async () => {
      const payload = createCategoryPayloadFactory.build();
      const dto = categoryDTOFactory.build({
        name: payload.name,
        organization_id: payload.organizationId
      });
      mockOverrideTypes.mockResolvedValue({
        data: dto,
        error: null
      });

      const result = await CategoryApi.add(payload);

      const insertCall = vi.mocked(mockSupabase.from().insert).mock.calls[0][0];

      expect(insertCall).toMatchObject({
        name: payload.name,
        organization_id: payload.organizationId
      });
      expect(result).toEqual({ id: dto.id, name: dto.name });
    });

    it('should throw "Já existe uma categoria" for duplicate names (23505)', async () => {
      mockOverrideTypes.mockResolvedValue({
        data: null,
        error: {
          message: 'duplicate key value violates unique constraint',
          code: '23505',
          details: null
        }
      });

      await expect(
        CategoryApi.add(createCategoryPayloadFactory.build())
      ).rejects.toThrow('Já existe uma categoria com este nome.');
    });

    it('should throw generic error for other failures', async () => {
      mockOverrideTypes.mockResolvedValue({
        data: null,
        error: { message: 'Unknown Error', code: '500' }
      });

      await expect(
        CategoryApi.add(createCategoryPayloadFactory.build())
      ).rejects.toThrow(
        'Não foi possível realizar a operação. Tente novamente.'
      );
    });

    it('should throw "Categoria não retornada" when data is null without error', async () => {
      mockOverrideTypes.mockResolvedValue({ data: null, error: null });

      await expect(
        CategoryApi.add(createCategoryPayloadFactory.build())
      ).rejects.toThrow('Erro inesperado: Categoria não retornada.');
    });
  });
});
