import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PdvApi } from '../../data/api';
import { cartItemFactory } from '../../tests/factories/cart-item.factory';
import { pdvProductFactory } from '../../tests/factories/pdv-product.factory';

import { PdvCartService, PdvSaleService, PdvService } from './index';

vi.mock('../../data/api', () => ({
  PdvApi: {
    setPdvCatalog: vi.fn(),
    createPosSale: vi.fn()
  }
}));

describe('PdvService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('setPdvCatalog', () => {
    it('should call PdvApi.setPdvCatalog with the given catalog id', async () => {
      vi.mocked(PdvApi.setPdvCatalog).mockResolvedValue(undefined);

      await PdvService.setPdvCatalog('cat-1');

      expect(PdvApi.setPdvCatalog).toHaveBeenCalledWith('cat-1');
    });

    it('should throw without calling the API when catalogId is empty', async () => {
      await expect(PdvService.setPdvCatalog('')).rejects.toThrow(
        'Selecione um catálogo para vincular ao PDV.'
      );
      expect(PdvApi.setPdvCatalog).not.toHaveBeenCalled();
    });

    it('should propagate errors from the API', async () => {
      vi.mocked(PdvApi.setPdvCatalog).mockRejectedValue(
        new Error('Acesso negado.')
      );

      await expect(PdvService.setPdvCatalog('cat-1')).rejects.toThrow(
        'Acesso negado.'
      );
    });
  });
});

describe('PdvCartService', () => {
  describe('computeItemPricing', () => {
    it('should return the reference price as the final price when there is no discount', () => {
      const result = PdvCartService.computeItemPricing({
        referencePrice: 8990,
        qty: 3
      });

      expect(result).toEqual({
        discountAmount: 0,
        unitFinalPrice: 8990,
        lineSubtotal: 26970
      });
    });

    it('should apply a flat amount discount', () => {
      const result = PdvCartService.computeItemPricing({
        referencePrice: 10000,
        qty: 2,
        discount: { mode: 'amount', value: 1500 }
      });

      expect(result).toEqual({
        discountAmount: 1500,
        unitFinalPrice: 8500,
        lineSubtotal: 17000
      });
    });

    it('should apply a percent discount converted to cents', () => {
      const result = PdvCartService.computeItemPricing({
        referencePrice: 10000,
        qty: 1,
        discount: { mode: 'percent', value: 10 }
      });

      expect(result).toEqual({
        discountAmount: 1000,
        unitFinalPrice: 9000,
        lineSubtotal: 9000
      });
    });

    it('should round the percent discount to the nearest cent', () => {
      const result = PdvCartService.computeItemPricing({
        referencePrice: 999,
        qty: 1,
        discount: { mode: 'percent', value: 33 }
      });

      expect(result.discountAmount).toBe(330);
      expect(result.unitFinalPrice).toBe(669);
    });

    it('should cap the discount at the reference price (final price never below zero)', () => {
      const result = PdvCartService.computeItemPricing({
        referencePrice: 5000,
        qty: 1,
        discount: { mode: 'amount', value: 9000 }
      });

      expect(result.discountAmount).toBe(5000);
      expect(result.unitFinalPrice).toBe(0);
    });

    it('should never produce a negative discount even with a negative input', () => {
      const result = PdvCartService.computeItemPricing({
        referencePrice: 5000,
        qty: 1,
        discount: { mode: 'amount', value: -100 }
      });

      expect(result.discountAmount).toBe(0);
      expect(result.unitFinalPrice).toBe(5000);
    });
  });

  describe('getAvailableStock', () => {
    it("should return the matching product's current stock", () => {
      const item = cartItemFactory.build({
        productId: 'p1',
        variantId: undefined
      });
      const products = [
        pdvProductFactory.build({
          productId: 'p1',
          variantId: undefined,
          stock: 7
        })
      ];

      expect(PdvCartService.getAvailableStock(item, products)).toBe(7);
    });

    it("should fall back to the item's own quantity when the product is not found", () => {
      const item = cartItemFactory.build({
        productId: 'p1',
        variantId: undefined,
        quantity: 4
      });

      expect(PdvCartService.getAvailableStock(item, [])).toBe(4);
    });
  });

  describe('hasStockIssue', () => {
    it('should be false when every item is within its available stock', () => {
      const items = [
        cartItemFactory.build({
          productId: 'p1',
          variantId: undefined,
          quantity: 2
        })
      ];
      const products = [
        pdvProductFactory.build({
          productId: 'p1',
          variantId: undefined,
          stock: 5
        })
      ];

      expect(PdvCartService.hasStockIssue(items, products)).toBe(false);
    });

    it('should be true when any item exceeds its available stock', () => {
      const items = [
        cartItemFactory.build({
          productId: 'p1',
          variantId: undefined,
          quantity: 6
        })
      ];
      const products = [
        pdvProductFactory.build({
          productId: 'p1',
          variantId: undefined,
          stock: 5
        })
      ];

      expect(PdvCartService.hasStockIssue(items, products)).toBe(true);
    });
  });
});

describe('PdvSaleService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('confirm', () => {
    it('should call PdvApi.createPosSale when the cart is valid', async () => {
      vi.mocked(PdvApi.createPosSale).mockResolvedValue('order-1');

      const input = {
        organizationId: 'org-1',
        catalogId: 'cat-1',
        items: [
          {
            productId: 'p1',
            quantity: 2,
            referencePrice: 5000,
            discountAmount: 0,
            availableStock: 5
          }
        ]
      };

      const result = await PdvSaleService.confirm(input);

      expect(PdvApi.createPosSale).toHaveBeenCalledWith(input);
      expect(result).toBe('order-1');
    });

    it('should reject an empty cart before calling the API', async () => {
      await expect(
        PdvSaleService.confirm({
          organizationId: 'org-1',
          catalogId: 'cat-1',
          items: []
        })
      ).rejects.toThrow('Adicione produtos para iniciar a venda.');

      expect(PdvApi.createPosSale).not.toHaveBeenCalled();
    });

    it('should reject when an item exceeds the available stock, without calling the API', async () => {
      await expect(
        PdvSaleService.confirm({
          organizationId: 'org-1',
          catalogId: 'cat-1',
          items: [
            {
              productId: 'p1',
              quantity: 5,
              referencePrice: 5000,
              discountAmount: 0,
              availableStock: 2
            }
          ]
        })
      ).rejects.toThrow('Um ou mais itens excedem o estoque disponível.');

      expect(PdvApi.createPosSale).not.toHaveBeenCalled();
    });

    it('should propagate errors from the API', async () => {
      vi.mocked(PdvApi.createPosSale).mockRejectedValue(
        new Error('Estoque insuficiente — há 1 disponível.')
      );

      await expect(
        PdvSaleService.confirm({
          organizationId: 'org-1',
          catalogId: 'cat-1',
          items: [
            {
              productId: 'p1',
              quantity: 1,
              referencePrice: 5000,
              discountAmount: 0,
              availableStock: 5
            }
          ]
        })
      ).rejects.toThrow('Estoque insuficiente — há 1 disponível.');
    });
  });
});
