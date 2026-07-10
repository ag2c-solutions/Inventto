import { describe, expect, it } from 'vitest';

import { pdvCatalogItemDTOFactory } from '../../tests/factories/pdv-product.factory';

import { PdvCatalogMapper, PdvProductMapper } from './index';

describe('PdvCatalogMapper', () => {
  it('should return null when there is no catalog linked', () => {
    const result = PdvCatalogMapper.toDomain({
      pdv_catalog_id: null,
      catalog: null
    });

    expect(result).toBeNull();
  });

  it('should map to a PdvCatalog when linked', () => {
    const result = PdvCatalogMapper.toDomain({
      pdv_catalog_id: 'cat-1',
      catalog: { id: 'cat-1', name: 'Loja Física' }
    });

    expect(result).toEqual({ id: 'cat-1', name: 'Loja Física' });
  });
});

describe('PdvProductMapper', () => {
  it('should convert price from reais (DB) to cents (domain)', () => {
    const dto = pdvCatalogItemDTOFactory.build({ price: 89.9 });

    const result = PdvProductMapper.toDomain(dto);

    expect(result.price).toBe(8990);
  });

  it('should use the product stock and mark isOut when a simple product has no stock', () => {
    const dto = pdvCatalogItemDTOFactory.build({
      product: {
        id: 'p1',
        name: 'Produto',
        sku: 'SKU-1',
        stock: 0,
        product_images: [],
        categories: []
      }
    });

    const result = PdvProductMapper.toDomain(dto);

    expect(result.stock).toBe(0);
    expect(result.isOut).toBe(true);
  });

  it('should use the variant stock and label when a variant is present', () => {
    const dto = pdvCatalogItemDTOFactory.build({
      variant_id: 'v1',
      variant: {
        id: 'v1',
        sku: 'SKU-1-A',
        stock: 3,
        options: [{ name: 'Cor', value: 'Azul' }]
      }
    });

    const result = PdvProductMapper.toDomain(dto);

    expect(result.variantId).toBe('v1');
    expect(result.stock).toBe(3);
    expect(result.isOut).toBe(false);
    expect(result.variantLabel).toBe('Cor: Azul');
    expect(result.sku).toBe('SKU-1-A');
  });

  it('should prefer the primary image when multiple images exist', () => {
    const dto = pdvCatalogItemDTOFactory.build({
      product: {
        id: 'p1',
        name: 'Produto',
        sku: 'SKU-1',
        stock: 5,
        product_images: [
          { url: 'secondary.jpg', is_primary: false },
          { url: 'primary.jpg', is_primary: true }
        ],
        categories: []
      }
    });

    const result = PdvProductMapper.toDomain(dto);

    expect(result.imageUrl).toBe('primary.jpg');
  });

  it('should map the first category id when present', () => {
    const dto = pdvCatalogItemDTOFactory.build({
      product: {
        id: 'p1',
        name: 'Produto',
        sku: 'SKU-1',
        stock: 5,
        product_images: [],
        categories: [{ category: { id: 'cat-a' } }]
      }
    });

    const result = PdvProductMapper.toDomain(dto);

    expect(result.categoryId).toBe('cat-a');
  });
});
