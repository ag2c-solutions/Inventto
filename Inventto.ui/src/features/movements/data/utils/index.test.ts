import { describe, expect, it } from 'vitest';

import type { ProductSummaryDTO, VariantSummaryDTO } from '../dtos';

import { formatVariantOptions, getProductImage } from './index';

describe('formatVariantOptions', () => {
  it('deve retornar undefined quando options é null', () => {
    expect(formatVariantOptions(null)).toBeUndefined();
  });

  it('deve retornar undefined quando options é undefined', () => {
    expect(formatVariantOptions(undefined)).toBeUndefined();
  });

  it('deve formatar um único par chave-valor', () => {
    expect(formatVariantOptions({ Chave: 'Valor' })).toBe('Chave: Valor');
  });

  it('deve formatar múltiplos pares separados por vírgula e espaço', () => {
    expect(formatVariantOptions({ Color: 'Blue', Size: 'M' })).toBe(
      'Color: Blue, Size: M'
    );
  });
});

describe('getProductImage', () => {
  it('deve retornar a URL da imagem primária da variante quando is_primary é true', () => {
    const variant: VariantSummaryDTO = {
      sku: null,
      options: null,
      product_variant_images: [
        { is_primary: true, product_images: { url: 'variant-primary.jpg' } },
        { is_primary: false, product_images: { url: 'variant-other.jpg' } }
      ]
    };

    expect(getProductImage(null, variant)).toBe('variant-primary.jpg');
  });

  it('deve retornar a URL da primeira imagem da variante quando não há imagem primária', () => {
    const variant: VariantSummaryDTO = {
      sku: null,
      options: null,
      product_variant_images: [
        { is_primary: false, product_images: { url: 'variant-first.jpg' } },
        { is_primary: false, product_images: { url: 'variant-second.jpg' } }
      ]
    };

    expect(getProductImage(null, variant)).toBe('variant-first.jpg');
  });

  it('deve retornar a URL da imagem primária do produto quando não há imagens de variante', () => {
    const product: ProductSummaryDTO = {
      name: 'Produto',
      product_images: [
        { url: 'product-primary.jpg', is_primary: true },
        { url: 'product-other.jpg', is_primary: false }
      ]
    };

    expect(getProductImage(product, null)).toBe('product-primary.jpg');
  });

  it('deve retornar a URL da primeira imagem do produto quando nenhuma está marcada como primária', () => {
    const product: ProductSummaryDTO = {
      name: 'Produto',
      product_images: [
        { url: 'product-first.jpg', is_primary: false },
        { url: 'product-second.jpg', is_primary: false }
      ]
    };

    expect(getProductImage(product, null)).toBe('product-first.jpg');
  });

  it('deve retornar undefined quando nem produto nem variante têm imagens', () => {
    const product: ProductSummaryDTO = { name: 'Produto', product_images: [] };
    const variant: VariantSummaryDTO = {
      sku: null,
      options: null,
      product_variant_images: []
    };

    expect(getProductImage(product, variant)).toBeUndefined();
  });

  it('deve retornar undefined quando ambos product e variant são null', () => {
    expect(getProductImage(null, null)).toBeUndefined();
  });
});
