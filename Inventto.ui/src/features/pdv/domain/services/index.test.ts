import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PdvApi } from '../../data/api';

import { PdvCartService, PdvService } from './index';

vi.mock('../../data/api', () => ({
  PdvApi: {
    setPdvCatalog: vi.fn()
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
});
