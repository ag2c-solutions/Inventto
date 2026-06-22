import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ViaCEPService } from './index';

describe('ViaCEPService', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  describe('lookup', () => {
    it('retorna null sem chamar fetch quando CEP tem menos de 8 dígitos', async () => {
      const result = await ViaCEPService.lookup('1234567');
      expect(result).toBeNull();
      expect(fetch).not.toHaveBeenCalled();
    });

    it('retorna null sem chamar fetch quando CEP tem mais de 8 dígitos', async () => {
      const result = await ViaCEPService.lookup('123456789');
      expect(result).toBeNull();
      expect(fetch).not.toHaveBeenCalled();
    });

    it('aceita CEP formatado com traço (remove máscara antes da validação)', async () => {
      const mockData = {
        cep: '01310-100',
        logradouro: 'Av. Paulista',
        complemento: '',
        bairro: 'Bela Vista',
        localidade: 'São Paulo',
        uf: 'SP'
      };
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(mockData)
      } as never);

      const result = await ViaCEPService.lookup('01310-100');
      expect(result).not.toBeNull();
      expect(result?.logradouro).toBe('Av. Paulista');
    });

    it('retorna null quando a resposta HTTP não é ok', async () => {
      vi.mocked(fetch).mockResolvedValue({ ok: false } as never);
      const result = await ViaCEPService.lookup('00000000');
      expect(result).toBeNull();
    });

    it('retorna null quando a resposta contém { erro: true }', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({ erro: true })
      } as never);

      const result = await ViaCEPService.lookup('00000000');
      expect(result).toBeNull();
    });

    it('retorna null quando a resposta contém { erro: "true" }', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({ erro: 'true' })
      } as never);

      const result = await ViaCEPService.lookup('99999999');
      expect(result).toBeNull();
    });

    it('retorna null quando fetch lança exceção de rede', async () => {
      vi.mocked(fetch).mockRejectedValue(new Error('Network error'));
      const result = await ViaCEPService.lookup('01310100');
      expect(result).toBeNull();
    });

    it('mapeia corretamente todos os campos da resposta de sucesso', async () => {
      const mockData = {
        cep: '01310-100',
        logradouro: 'Av. Paulista',
        complemento: 'de 610 a 1612 - lado par',
        bairro: 'Bela Vista',
        localidade: 'São Paulo',
        uf: 'SP'
      };
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(mockData)
      } as never);

      const result = await ViaCEPService.lookup('01310100');
      expect(result).toEqual(mockData);
    });

    it('chama a URL correta para o CEP informado', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({
          cep: '01310-100',
          logradouro: '',
          complemento: '',
          bairro: '',
          localidade: '',
          uf: ''
        })
      } as never);

      await ViaCEPService.lookup('01310-100');
      expect(fetch).toHaveBeenCalledWith(
        'https://viacep.com.br/ws/01310100/json/'
      );
    });
  });
});
