import { describe, expect, it } from 'vitest';

import type { Movement } from '../../../../domain/entities';

import {
  matchesProductSearch,
  resolveProductNameById
} from './matches-product-search';

const buildMovement = (overrides: Partial<Movement> = {}): Movement => ({
  id: 'mov-1',
  organizationId: 'org-1',
  type: 'entry',
  reason: 'Compra',
  createdAt: new Date('2023-10-01T10:00:00Z'),
  executedAt: new Date('2023-10-01T10:00:00Z'),
  totalQuantity: 5,
  totalValue: 50,
  items: [
    {
      id: 'item-1',
      movementId: 'mov-1',
      productId: 'prod-1',
      quantity: 5,
      unitCost: 10,
      unitPrice: 20,
      product: { name: 'Camisa Social Algodão', sku: 'CS-ALG-01' }
    }
  ],
  ...overrides
});

describe('matchesProductSearch', () => {
  it('should match when the product name contains the term', () => {
    expect(matchesProductSearch(buildMovement(), 'camisa social')).toBe(true);
  });

  it('should match when the sku contains the term (case-insensitive)', () => {
    expect(matchesProductSearch(buildMovement(), 'cs-alg')).toBe(true);
  });

  it('should not match when neither name nor sku contain the term', () => {
    expect(matchesProductSearch(buildMovement(), 'guarda-chuva')).toBe(false);
  });

  it('should match everything when the term is empty', () => {
    expect(matchesProductSearch(buildMovement(), '   ')).toBe(true);
  });

  it('should handle items without a sku', () => {
    const movement = buildMovement({
      items: [
        {
          id: 'item-1',
          movementId: 'mov-1',
          productId: 'prod-1',
          quantity: 1,
          unitCost: 10,
          unitPrice: 20,
          product: { name: 'Sem SKU' }
        }
      ]
    });

    expect(matchesProductSearch(movement, 'sem sku')).toBe(true);
  });
});

describe('resolveProductNameById', () => {
  it('should return undefined when no productId is provided', () => {
    expect(
      resolveProductNameById([buildMovement()], undefined)
    ).toBeUndefined();
  });

  it('should find the product name across movements', () => {
    const movements = [
      buildMovement({ id: 'mov-2', items: [] }),
      buildMovement()
    ];

    expect(resolveProductNameById(movements, 'prod-1')).toBe(
      'Camisa Social Algodão'
    );
  });

  it('should return undefined when no item matches the productId', () => {
    expect(
      resolveProductNameById([buildMovement()], 'prod-999')
    ).toBeUndefined();
  });
});
