import { describe, expect, it } from 'vitest';

import { generateVariants } from './generate-variants';

describe('generateVariants', () => {
  it('should generate the cartesian product of attribute values', () => {
    const variants = generateVariants({
      skuBase: 'CAM',
      attributes: [
        { name: 'Cor', values: ['Azul', 'Preto'], type: 'text' },
        { name: 'Tamanho', values: ['P', 'M'], type: 'text' }
      ]
    });

    expect(variants).toHaveLength(4);
  });

  it('should build deterministic, collision-safe SKUs from option values', () => {
    const variants = generateVariants({
      skuBase: 'cam',
      attributes: [
        { name: 'Cor', values: ['Azul', 'Azul Claro'], type: 'text' }
      ]
    });

    const skus = variants.map((variant) => variant.sku);

    expect(new Set(skus).size).toBe(skus.length);
  });

  it('should return an empty array when there are no attributes', () => {
    expect(generateVariants({ skuBase: 'CAM', attributes: [] })).toEqual([]);
  });

  it('should ignore attributes without values, combining only the remaining ones', () => {
    const variants = generateVariants({
      skuBase: 'CAM',
      attributes: [
        { name: 'Cor', values: ['Azul'], type: 'text' },
        { name: 'Tamanho', values: [], type: 'text' }
      ]
    });

    expect(variants).toHaveLength(1);
    expect(variants[0].options).toEqual([{ name: 'Cor', value: 'Azul' }]);
  });

  it('should return an empty array when every attribute has no values', () => {
    const variants = generateVariants({
      skuBase: 'CAM',
      attributes: [{ name: 'Tamanho', values: [], type: 'text' }]
    });

    expect(variants).toEqual([]);
  });

  it('should preserve existing variants matching the same option combination', () => {
    const idFactory = () => 'new-id';

    const existingVariants = [
      {
        id: 'existing-1',
        sku: 'OLD-SKU',
        stock: 30,
        minimumStock: 5,
        isActive: true,
        options: [{ name: 'Cor', value: 'Azul' }],
        images: []
      }
    ];

    const variants = generateVariants({
      skuBase: 'CAM',
      attributes: [{ name: 'Cor', values: ['Azul', 'Preto'], type: 'text' }],
      existingVariants,
      idFactory
    });

    expect(variants).toHaveLength(2);
    const preserved = variants.find(
      (variant) => variant.options[0].value === 'Azul'
    );
    expect(preserved).toEqual(existingVariants[0]);

    const created = variants.find(
      (variant) => variant.options[0].value === 'Preto'
    );
    expect(created?.id).toBe('new-id');
    expect(created?.stock).toBe(0);
  });

  it('should discard existing variants that no longer match any combination', () => {
    const existingVariants = [
      {
        id: 'stale-1',
        sku: 'STALE-SKU',
        stock: 10,
        minimumStock: 0,
        isActive: true,
        options: [{ name: 'Cor', value: 'Verde' }],
        images: []
      }
    ];

    const variants = generateVariants({
      skuBase: 'CAM',
      attributes: [{ name: 'Cor', values: ['Azul'], type: 'text' }],
      existingVariants
    });

    expect(
      variants.find((variant) => variant.id === 'stale-1')
    ).toBeUndefined();
  });

  it('should trim the attribute name and de-duplicate values after trimming', () => {
    const variants = generateVariants({
      skuBase: 'CAM',
      attributes: [
        { name: '  Cor  ', values: [' Azul ', 'Azul'], type: 'text' }
      ]
    });

    expect(variants).toHaveLength(1);
    expect(variants[0].options[0].name).toBe('Cor');
    expect(variants[0].options[0].value).toBe('Azul');
  });
});
