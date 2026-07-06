import { describe, expect, it } from 'vitest';

import type { CatalogThemeConfig } from '../../domain/entities';
import {
  catalogDTOFactory,
  catalogThemeConfigDTOFactory
} from '../../tests/factories/catalog.factory';
import type { CatalogThemeConfigDTO, PublicCatalogResponseDTO } from '../dtos';

import { CatalogMapper } from './index';

describe('CatalogMapper', () => {
  const mockThemeDTO = catalogThemeConfigDTOFactory.build({
    colors: { primary: '#FF0000', background: '#000000', text: '#FFFFFF' },
    branding: { show_cover: false, logo_url: 'logo.png' },
    layout: { mode: 'list', products_per_page: 50 },
    behavior: { display_price: false, whatsapp_message: 'Zap' }
  });

  const mockCatalogDTO = catalogDTOFactory.build({
    theme_config: mockThemeDTO
  });

  describe('toDomain', () => {
    it('deve mapear corretamente um DTO completo para Domain', () => {
      const result = CatalogMapper.toDomain(mockCatalogDTO);

      expect(result.id).toBe(mockCatalogDTO.id);
      expect(result.whatsappNumber).toBe(mockCatalogDTO.whatsapp_number);
      expect(result.themeConfig.colors.primary).toBe('#FF0000');
      expect(result.themeConfig.branding.showCover).toBe(false);
    });

    it('deve usar string vazia quando description é falsy', () => {
      const dtoSemDescricao = {
        ...mockCatalogDTO,
        description: null as unknown as string
      };

      const result = CatalogMapper.toDomain(dtoSemDescricao);

      expect(result.description).toBe('');
    });

    it('deve aplicar Defaults se o theme_config vier vazio ou parcial', () => {
      const dtoIncompleto = {
        ...mockCatalogDTO,
        theme_config: {} as CatalogThemeConfigDTO
      };

      const result = CatalogMapper.toDomain(dtoIncompleto);

      expect(result.themeConfig.colors.primary).toBe('#000000');
      expect(result.themeConfig.layout.mode).toBe('grid');
      expect(result.themeConfig.branding.showCover).toBe(true);
    });
  });

  describe('toPersistence', () => {
    it('deve converter Domain Payload (camelCase) para DTO (snake_case)', () => {
      const payloadDomain = {
        name: 'Novo',
        slug: 'novo',
        whatsappNumber: '123',
        isActive: true,
        themeConfig: {
          colors: { primary: '#ABC', background: '#FFF', text: '#000' },
          branding: { showCover: true },
          layout: { mode: 'grid', productsPerPage: 10 },
          behavior: { displayPrice: true, whatsappMessage: 'Oi' }
        } as CatalogThemeConfig
      };

      const result = CatalogMapper.toPersistence(payloadDomain);

      expect(result.whatsapp_number).toBe('123');
      expect(result.is_active).toBe(true);
      expect(result.theme_config?.branding.show_cover).toBe(true);
      expect(result.theme_config?.layout.products_per_page).toBe(10);
    });

    it('deve lidar com themeConfig undefined', () => {
      const payloadSemTema = {
        name: 'Sem Tema',
        slug: 'sem-tema',
        whatsappNumber: '123'
      };

      const result = CatalogMapper.toPersistence(payloadSemTema);

      expect(result.whatsapp_number).toBe('123');
      expect(result.theme_config).toBeUndefined();
    });
  });

  describe('toPublicStorefront', () => {
    it('deve mapear corretamente a resposta da RPC pública', () => {
      const mockPublicDTO: PublicCatalogResponseDTO = {
        catalog: {
          name: 'Loja Pública',
          description: 'Desc',
          whatsapp_number: '551199999999',
          theme_config: { colors: { primary: '#FFF' } } as CatalogThemeConfigDTO
        },
        items: [
          {
            item_id: 'item-1',
            catalog_slug: 'loja-publica',
            product_name: 'Produto 1',
            product_description: 'Desc Prod',
            variant_id: null,
            variant_attributes: null,
            price: 100,
            original_price: 120,
            is_featured: true,
            images: ['img1.jpg'],
            in_stock: true
          }
        ]
      };

      const result = CatalogMapper.toPublicStorefront(mockPublicDTO);

      expect(result.info.name).toBe('Loja Pública');
      expect(result.products).toHaveLength(1);
      expect(result.products[0].name).toBe('Produto 1');
      expect(result.products[0].images).toEqual(['img1.jpg']);
    });

    it('deve mapear a variante quando variant_id está presente', () => {
      const mockPublicDTO: PublicCatalogResponseDTO = {
        catalog: {
          name: 'Loja Pública',
          description: null,
          whatsapp_number: '551199999999',
          theme_config: {} as CatalogThemeConfigDTO
        },
        items: [
          {
            item_id: 'item-1',
            catalog_slug: 'loja-publica',
            product_name: 'Produto 1',
            product_description: null,
            variant_id: 'variant-1',
            variant_attributes: { cor: 'azul' },
            price: 100,
            original_price: null,
            is_featured: false,
            images: 'not-an-array' as unknown as string[],
            in_stock: false
          }
        ]
      };

      const result = CatalogMapper.toPublicStorefront(mockPublicDTO);

      expect(result.info.description).toBe('');
      expect(result.products[0].description).toBe('');
      expect(result.products[0].images).toEqual([]);
      expect(result.products[0].variant).toEqual({
        id: 'variant-1',
        attributes: { cor: 'azul' }
      });
    });

    it('deve omitir a variante quando variant_id está ausente', () => {
      const mockPublicDTO: PublicCatalogResponseDTO = {
        catalog: {
          name: 'Loja Pública',
          description: 'Desc',
          whatsapp_number: '551199999999',
          theme_config: {} as CatalogThemeConfigDTO
        },
        items: [
          {
            item_id: 'item-2',
            catalog_slug: 'loja-publica',
            product_name: 'Produto 2',
            product_description: 'Desc Prod',
            variant_id: null,
            variant_attributes: null,
            price: 50,
            original_price: null,
            is_featured: false,
            images: [],
            in_stock: true
          }
        ]
      };

      const result = CatalogMapper.toPublicStorefront(mockPublicDTO);

      expect(result.products[0].variant).toBeUndefined();
    });

    it('deve usar atributos vazios quando variant_id está presente mas variant_attributes é falsy', () => {
      const mockPublicDTO: PublicCatalogResponseDTO = {
        catalog: {
          name: 'Loja Pública',
          description: 'Desc',
          whatsapp_number: '551199999999',
          theme_config: {} as CatalogThemeConfigDTO
        },
        items: [
          {
            item_id: 'item-3',
            catalog_slug: 'loja-publica',
            product_name: 'Produto 3',
            product_description: 'Desc Prod',
            variant_id: 'variant-3',
            variant_attributes: null,
            price: 30,
            original_price: null,
            is_featured: false,
            images: [],
            in_stock: true
          }
        ]
      };

      const result = CatalogMapper.toPublicStorefront(mockPublicDTO);

      expect(result.products[0].variant).toEqual({
        id: 'variant-3',
        attributes: {}
      });
    });

    it('deve mapear products como array vazio quando items está ausente', () => {
      const mockPublicDTO = {
        catalog: {
          name: 'Loja Pública',
          description: 'Desc',
          whatsapp_number: '551199999999',
          theme_config: {} as CatalogThemeConfigDTO
        }
      } as PublicCatalogResponseDTO;

      const result = CatalogMapper.toPublicStorefront(mockPublicDTO);

      expect(result.products).toEqual([]);
    });

    it('deve lançar erro se os dados do catálogo forem inválidos', () => {
      // @ts-expect-error - Testando caso nulo forçado
      expect(() => CatalogMapper.toPublicStorefront(null)).toThrow(
        'Dados do catálogo inválidos.'
      );
      // @ts-expect-error - Testando objeto parcial sem catalog
      expect(() => CatalogMapper.toPublicStorefront({ items: [] })).toThrow(
        'Dados do catálogo inválidos.'
      );
    });
  });
});
