import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { CatalogDTO, CatalogThemeConfigDTO } from '../dtos';

import { CatalogApi } from './index';

const { mockSupabase, mockSelect, mockOverrideTypes, mockEq, mockRpc } =
  vi.hoisted(() => {
    const mockSelect = vi.fn();
    const mockOrder = vi.fn();
    const mockEq = vi.fn();
    const mockSingle = vi.fn();
    const mockOverrideTypes = vi.fn();
    const mockInsert = vi.fn();
    const mockUpdate = vi.fn();
    const mockDelete = vi.fn();
    const mockRpc = vi.fn();

    const queryBuilder = {
      select: mockSelect,
      order: mockOrder,
      eq: mockEq,
      single: mockSingle,
      overrideTypes: mockOverrideTypes,
      insert: mockInsert,
      update: mockUpdate,
      delete: mockDelete
    };

    mockSelect.mockReturnValue(queryBuilder);
    mockOrder.mockReturnValue(queryBuilder);
    mockEq.mockReturnValue(queryBuilder);
    mockSingle.mockReturnValue(queryBuilder);
    mockInsert.mockReturnValue(queryBuilder);
    mockUpdate.mockReturnValue(queryBuilder);
    mockDelete.mockReturnValue(queryBuilder);

    return {
      mockSupabase: {
        from: vi.fn(() => queryBuilder),
        rpc: mockRpc
      },
      mockSelect,
      mockOrder,
      mockEq,
      mockSingle,
      mockOverrideTypes,
      mockInsert,
      mockUpdate,
      mockDelete,
      mockRpc
    };
  });

vi.mock('@/infra/supabase', () => ({
  supabase: mockSupabase
}));

const mockThemeConfigDTO: CatalogThemeConfigDTO = {
  colors: { primary: '#000000', background: '#ffffff' },
  branding: { show_cover: false },
  layout: { mode: 'grid', products_per_page: 10 },
  behavior: { display_price: true, whatsapp_message: 'Olá' }
};

const mockCatalogDTO: CatalogDTO = {
  id: 'cat-1',
  organization_id: 'org-1',
  name: 'Catálogo Teste',
  slug: 'teste',
  whatsapp_number: '551199999999',
  description: 'Desc',
  is_active: true,
  theme_config: mockThemeConfigDTO,
  created_at: '2023-01-01',
  updated_at: '2023-01-01'
};

describe('CatalogApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const consoleErrorSpy = vi.spyOn(console, 'error');

  afterEach(() => {
    consoleErrorSpy.mockReset();
  });

  // ─────────────────────────────────────────────
  // QUERIES (fluxo: API → Hook → Component)
  // ─────────────────────────────────────────────

  describe('getAll', () => {
    it('should query "catalogs" and return mapped domain objects', async () => {
      mockOverrideTypes.mockResolvedValue({
        data: [mockCatalogDTO],
        error: null
      });

      const result = await CatalogApi.getAll();

      expect(mockSupabase.from).toHaveBeenCalledWith('catalogs');
      expect(mockSelect).toHaveBeenCalled();
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('cat-1');
      expect(result[0].whatsappNumber).toBe('551199999999');
    });

    it('should throw handled error on database failure', async () => {
      consoleErrorSpy.mockImplementation(() => {});
      mockOverrideTypes.mockResolvedValue({
        data: null,
        error: { message: 'Erro DB', code: 'PGRST000' }
      });

      await expect(CatalogApi.getAll()).rejects.toThrow(
        'Ocorreu um erro inesperado ao processar o catálogo.'
      );
    });
  });

  describe('getOneById', () => {
    it('should filter by id and return the mapped catalog', async () => {
      mockOverrideTypes.mockResolvedValue({
        data: mockCatalogDTO,
        error: null
      });

      const result = await CatalogApi.getOneById('cat-1');

      expect(mockSupabase.from).toHaveBeenCalledWith('catalogs');
      expect(mockEq).toHaveBeenCalledWith('id', 'cat-1');
      expect(result.id).toBe('cat-1');
    });

    it('should throw "Catálogo não encontrado" for PGRST116', async () => {
      mockOverrideTypes.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'Row not found' }
      });

      await expect(CatalogApi.getOneById('inexistente')).rejects.toThrow(
        'Catálogo não encontrado.'
      );
    });

    it('should throw handled error for generic database errors', async () => {
      consoleErrorSpy.mockImplementation(() => {});
      mockOverrideTypes.mockResolvedValue({
        data: null,
        error: { code: '500', message: 'Database crash' }
      });

      await expect(CatalogApi.getOneById('cat-1')).rejects.toThrow(
        'Ocorreu um erro inesperado ao processar o catálogo.'
      );
    });
  });

  // ─────────────────────────────────────────────
  // MUTATIONS (operações de escrita via supabase)
  // ─────────────────────────────────────────────

  describe('add', () => {
    it('should insert with is_active=true and return the created catalog', async () => {
      mockOverrideTypes.mockResolvedValue({
        data: mockCatalogDTO,
        error: null
      });

      const payload = {
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

      const result = await CatalogApi.add(payload);
      const insertCall = vi.mocked(mockSupabase.from().insert).mock.calls[0][0];

      expect(insertCall).toMatchObject({
        whatsapp_number: '123',
        slug: 'novo',
        is_active: true
      });
      expect(result.id).toBe('cat-1');
    });

    it('should throw "slug em uso" for duplicate key error (23505 + slug)', async () => {
      consoleErrorSpy.mockImplementation(() => {});
      mockOverrideTypes.mockResolvedValue({
        data: null,
        error: {
          code: '23505',
          message: 'duplicate key value violates unique constraint',
          details: 'Key (slug)=(teste) already exists.'
        }
      });

      await expect(
        CatalogApi.add({
          name: 'A',
          slug: 'teste',
          whatsappNumber: '1',
          themeConfig: {
            colors: { primary: '#000000', background: '#ffffff' },
            branding: { showCover: false },
            layout: { mode: 'grid', productsPerPage: 10 },
            behavior: { displayPrice: true, whatsappMessage: 'Olá' }
          }
        })
      ).rejects.toThrow(
        'Este link personalizado já está em uso. Por favor, escolha outro.'
      );
    });

    it('should throw handled error on generic insertion failure', async () => {
      consoleErrorSpy.mockImplementation(() => {});
      mockOverrideTypes.mockResolvedValue({
        data: null,
        error: { code: '500', message: 'Insert failed' }
      });

      await expect(
        CatalogApi.add({
          name: 'A',
          slug: 'teste',
          whatsappNumber: '1',
          themeConfig: {
            colors: { primary: '#000000', background: '#ffffff' },
            branding: { showCover: false },
            layout: { mode: 'grid', productsPerPage: 10 },
            behavior: { displayPrice: true, whatsappMessage: 'Olá' }
          }
        })
      ).rejects.toThrow('Ocorreu um erro inesperado ao processar o catálogo.');
    });
  });

  describe('update', () => {
    it('should patch only provided fields and set updated_at', async () => {
      mockOverrideTypes.mockResolvedValue({
        data: { ...mockCatalogDTO, name: 'Editado' },
        error: null
      });

      const result = await CatalogApi.update({ id: 'cat-1', name: 'Editado' });
      const updateCall = vi.mocked(mockSupabase.from().update).mock.calls[0][0];

      expect(updateCall.name).toBe('Editado');
      expect(updateCall.whatsapp_number).toBeUndefined();
      expect(updateCall.theme_config).toBeUndefined();
      expect(updateCall.updated_at).toBeDefined();
      expect(result.name).toBe('Editado');
    });

    it('should serialize themeConfig to snake_case when provided', async () => {
      mockOverrideTypes.mockResolvedValue({
        data: mockCatalogDTO,
        error: null
      });

      await CatalogApi.update({
        id: 'cat-1',
        themeConfig: {
          colors: { primary: '#FFF', background: '#000' },
          branding: { showCover: true },
          layout: { mode: 'list', productsPerPage: 10 },
          behavior: { displayPrice: true, whatsappMessage: 'Oi' }
        }
      });

      const updateCall = vi.mocked(mockSupabase.from().update).mock.calls[0][0];

      expect(updateCall.theme_config).toBeDefined();
      expect(updateCall.theme_config.colors.primary).toBe('#FFF');
      expect(updateCall.theme_config.layout.products_per_page).toBe(10);
    });

    it('should throw handled error on update failure', async () => {
      consoleErrorSpy.mockImplementation(() => {});
      mockOverrideTypes.mockResolvedValue({
        data: null,
        error: { code: '500', message: 'Update failed' }
      });

      await expect(
        CatalogApi.update({ id: 'cat-1', name: 'Fail' })
      ).rejects.toThrow('Ocorreu um erro inesperado ao processar o catálogo.');
    });
  });

  describe('remove', () => {
    it('should delete catalog by id successfully', async () => {
      mockSupabase.from.mockReturnValue({
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null })
        })
      } as unknown as ReturnType<typeof mockSupabase.from>);

      await expect(CatalogApi.remove('cat-1')).resolves.not.toThrow();
    });

    it('should throw handled error when deletion fails', async () => {
      consoleErrorSpy.mockImplementation(() => {});
      mockSupabase.from.mockReturnValue({
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: { message: 'DB Error' } })
        })
      } as unknown as ReturnType<typeof mockSupabase.from>);

      await expect(CatalogApi.remove('cat-1')).rejects.toThrow(
        'Ocorreu um erro inesperado'
      );
    });
  });

  describe('checkSlugAvailability', () => {
    it('should return true when count is 0 (slug available)', async () => {
      const mockSelectCount = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ count: 0, error: null })
      });
      mockSupabase.from.mockReturnValue({
        select: mockSelectCount
      } as unknown as ReturnType<typeof mockSupabase.from>);

      expect(await CatalogApi.checkSlugAvailability('livre')).toBe(true);
    });

    it('should return false when count > 0 (slug taken)', async () => {
      const mockSelectCount = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ count: 1, error: null })
      });
      mockSupabase.from.mockReturnValue({
        select: mockSelectCount
      } as unknown as ReturnType<typeof mockSupabase.from>);

      expect(await CatalogApi.checkSlugAvailability('ocupado')).toBe(false);
    });

    it('should return false without querying when slug is too short', async () => {
      expect(await CatalogApi.checkSlugAvailability('')).toBe(false);
      expect(await CatalogApi.checkSlugAvailability('ab')).toBe(false);
      expect(mockSupabase.from).not.toHaveBeenCalled();
    });

    it('should return false and log error when database throws', async () => {
      consoleErrorSpy.mockImplementation(() => {});
      mockSupabase.from.mockImplementation(() => {
        throw new Error('Crash Database');
      });

      expect(await CatalogApi.checkSlugAvailability('slug-teste')).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should return false when database returns an error object', async () => {
      const mockSelectCount = vi.fn().mockReturnValue({
        eq: vi
          .fn()
          .mockResolvedValue({ count: null, error: { message: 'DB Error' } })
      });
      mockSupabase.from.mockReturnValue({
        select: mockSelectCount
      } as unknown as ReturnType<typeof mockSupabase.from>);

      expect(await CatalogApi.checkSlugAvailability('error-slug')).toBe(false);
    });
  });

  describe('getPublicStorefront', () => {
    it('should call rpc "get_public_catalog" and return mapped storefront', async () => {
      const mockRpcData = {
        catalog: {
          name: 'Loja Pública',
          description: null,
          whatsapp_number: '551199999999',
          theme_config: mockThemeConfigDTO
        },
        items: []
      };

      mockRpc.mockResolvedValue({ data: mockRpcData, error: null });

      const result = await CatalogApi.getPublicStorefront('minha-loja');

      expect(mockRpc).toHaveBeenCalledWith('get_public_catalog', {
        p_slug: 'minha-loja'
      });
      expect(result.info.name).toBe('Loja Pública');
      expect(result.products).toHaveLength(0);
    });

    it('should throw handled error when rpc fails', async () => {
      consoleErrorSpy.mockImplementation(() => {});
      mockRpc.mockResolvedValue({
        data: null,
        error: { message: 'RPC error', code: '500' }
      });

      await expect(
        CatalogApi.getPublicStorefront('slug-invalido')
      ).rejects.toThrow('Ocorreu um erro inesperado ao processar o catálogo.');
    });
  });
});
