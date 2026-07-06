import { describe, expect, it } from 'vitest';

import { DEFAULT_THEME } from '../../domain/constants';
import type { CatalogThemeConfig } from '../../domain/entities';
import type { CatalogThemeConfigDTO } from '../dtos';

import { formatThemeForPersistence, parseThemeConfig } from './index';

describe('parseThemeConfig', () => {
  it('should apply every default when the DTO is null', () => {
    const result = parseThemeConfig(null);

    expect(result.colors.primary).toBe(DEFAULT_THEME.colors.primary);
    expect(result.branding.showCover).toBe(DEFAULT_THEME.branding.showCover);
    expect(result.layout.mode).toBe(DEFAULT_THEME.layout.mode);
    expect(result.behavior.displayPrice).toBe(
      DEFAULT_THEME.behavior.displayPrice
    );
    expect(result.socialLinks).toBeUndefined();
  });

  it('should preserve every provided field instead of falling back to defaults', () => {
    const dto: CatalogThemeConfigDTO = {
      colors: { primary: '#111111', background: '#222222', text: '#333333' },
      branding: {
        show_cover: false,
        logo_url: 'logo.png',
        cover_image_url: 'cover.png'
      },
      layout: {
        mode: 'list',
        products_per_page: 8,
        card_style: 'shadow'
      },
      behavior: {
        display_price: false,
        whatsapp_message: 'Oi!',
        show_out_of_stock: true
      },
      social_links: {
        instagram: '@loja',
        facebook: 'loja',
        website: 'loja.com'
      }
    };

    const result = parseThemeConfig(dto);

    expect(result.colors).toEqual({
      primary: '#111111',
      background: '#222222',
      text: '#333333',
      secondary: undefined
    });
    expect(result.branding).toEqual({
      showCover: false,
      logoUrl: 'logo.png',
      coverImageUrl: 'cover.png'
    });
    expect(result.layout).toEqual({
      mode: 'list',
      productsPerPage: 8,
      cardStyle: 'shadow'
    });
    expect(result.behavior).toEqual({
      displayPrice: false,
      whatsappMessage: 'Oi!',
      showOutOfStock: true
    });
    expect(result.socialLinks).toEqual(dto.social_links);
  });
});

describe('formatThemeForPersistence', () => {
  it('should apply every default when the domain config sections are missing', () => {
    const result = formatThemeForPersistence(
      {} as unknown as CatalogThemeConfig
    );

    expect(result.colors.primary).toBe(DEFAULT_THEME.colors.primary);
    expect(result.branding.show_cover).toBe(DEFAULT_THEME.branding.showCover);
    expect(result.layout.mode).toBe(DEFAULT_THEME.layout.mode);
    expect(result.behavior.display_price).toBe(
      DEFAULT_THEME.behavior.displayPrice
    );
    expect(result.social_links).toBeUndefined();
  });

  it('should fall back per-field to defaults when a section is only partially provided', () => {
    const domain = {
      colors: { primary: '#abc' },
      branding: {},
      layout: { productsPerPage: 5 },
      behavior: { whatsappMessage: 'Oi' }
    } as unknown as CatalogThemeConfig;

    const result = formatThemeForPersistence(domain);

    expect(result.colors).toEqual({
      primary: '#abc',
      background: DEFAULT_THEME.colors.background,
      text: DEFAULT_THEME.colors.text,
      secondary: undefined
    });
    expect(result.branding.show_cover).toBe(DEFAULT_THEME.branding.showCover);
    expect(result.layout).toEqual({
      mode: DEFAULT_THEME.layout.mode,
      products_per_page: 5,
      card_style: undefined
    });
    expect(result.behavior).toEqual({
      display_price: DEFAULT_THEME.behavior.displayPrice,
      whatsapp_message: 'Oi',
      show_out_of_stock: undefined
    });
  });

  it('should fall back to defaults for the complementary set of missing fields', () => {
    const domain = {
      colors: { background: '#def', text: '#123' },
      branding: { showCover: false },
      layout: { mode: 'list' },
      behavior: { displayPrice: false }
    } as unknown as CatalogThemeConfig;

    const result = formatThemeForPersistence(domain);

    expect(result.colors.primary).toBe(DEFAULT_THEME.colors.primary);
    expect(result.layout.products_per_page).toBe(
      DEFAULT_THEME.layout.productsPerPage
    );
    expect(result.behavior.whatsapp_message).toBe(
      DEFAULT_THEME.behavior.whatsappMessage
    );
  });

  it('should preserve every provided field instead of falling back to defaults', () => {
    const domain: CatalogThemeConfig = {
      colors: { primary: '#abc', background: '#def', text: '#123' },
      branding: {
        showCover: false,
        logoUrl: 'logo.png',
        coverImageUrl: 'cover.png'
      },
      layout: { mode: 'list', productsPerPage: 15, cardStyle: 'border' },
      behavior: {
        displayPrice: false,
        whatsappMessage: 'Fala!',
        showOutOfStock: true
      },
      socialLinks: { instagram: '@loja' }
    };

    const result = formatThemeForPersistence(domain);

    expect(result.colors).toEqual({
      primary: '#abc',
      background: '#def',
      text: '#123',
      secondary: undefined
    });
    expect(result.branding).toEqual({
      show_cover: false,
      logo_url: 'logo.png',
      cover_image_url: 'cover.png'
    });
    expect(result.layout).toEqual({
      mode: 'list',
      products_per_page: 15,
      card_style: 'border'
    });
    expect(result.behavior).toEqual({
      display_price: false,
      whatsapp_message: 'Fala!',
      show_out_of_stock: true
    });
    expect(result.social_links).toEqual(domain.socialLinks);
  });
});
