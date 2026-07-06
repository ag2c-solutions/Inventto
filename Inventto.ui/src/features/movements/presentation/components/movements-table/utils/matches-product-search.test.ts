import { describe, expect, it } from 'vitest';

import {
  movementFactory,
  movementItemFactory
} from '../../../../tests/factories/movement.factory';

import {
  matchesProductSearch,
  resolveProductNameById
} from './matches-product-search';

describe('matchesProductSearch', () => {
  it('should match when the product name contains the term', () => {
    const movement = movementFactory.build({
      items: [
        movementItemFactory.build({
          product: { name: 'Camisa Social Algodão', sku: 'CS-ALG-01' }
        })
      ]
    });

    expect(matchesProductSearch(movement, 'camisa social')).toBe(true);
  });

  it('should match when the sku contains the term (case-insensitive)', () => {
    const movement = movementFactory.build({
      items: [
        movementItemFactory.build({
          product: { name: 'Camisa Social Algodão', sku: 'CS-ALG-01' }
        })
      ]
    });

    expect(matchesProductSearch(movement, 'cs-alg')).toBe(true);
  });

  it('should not match when neither name nor sku contain the term', () => {
    const movement = movementFactory.build({
      items: [
        movementItemFactory.build({
          product: { name: 'Camisa Social Algodão', sku: 'CS-ALG-01' }
        })
      ]
    });

    expect(matchesProductSearch(movement, 'guarda-chuva')).toBe(false);
  });

  it('should match everything when the term is empty', () => {
    const movement = movementFactory.build();

    expect(matchesProductSearch(movement, '   ')).toBe(true);
  });

  it('should handle items without a sku', () => {
    const movement = movementFactory.build({
      items: [movementItemFactory.build({ product: { name: 'Sem SKU' } })]
    });

    expect(matchesProductSearch(movement, 'sem sku')).toBe(true);
  });
});

describe('resolveProductNameById', () => {
  it('should return undefined when no productId is provided', () => {
    expect(
      resolveProductNameById([movementFactory.build()], undefined)
    ).toBeUndefined();
  });

  it('should find the product name across movements', () => {
    const targetItem = movementItemFactory.build({
      productId: 'prod-1',
      product: { name: 'Camisa Social Algodão' }
    });
    const movements = [
      movementFactory.build({ items: [] }),
      movementFactory.build({ items: [targetItem] })
    ];

    expect(resolveProductNameById(movements, 'prod-1')).toBe(
      'Camisa Social Algodão'
    );
  });

  it('should return undefined when no item matches the productId', () => {
    const movement = movementFactory.build({
      items: [movementItemFactory.build({ productId: 'prod-1' })]
    });

    expect(resolveProductNameById([movement], 'prod-999')).toBeUndefined();
  });
});
