import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PdvApi } from '../../data/api';

import { PdvService } from './index';

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
