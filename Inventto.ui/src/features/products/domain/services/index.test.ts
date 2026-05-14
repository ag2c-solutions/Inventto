import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../data/api', () => ({
  ProductAPI: {
    getAllForSales: vi.fn(),
    getAllForInternals: vi.fn(),
    getOneById: vi.fn(),
    add: vi.fn(),
    update: vi.fn()
  }
}));

import { ProductAPI } from '../../data/api';

import { ProductService } from './index';

const mockProduct = { id: 'p-1', name: 'Produto A' } as never;

describe('ProductService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAll', () => {
    it('deve lançar quando organizationId é undefined', async () => {
      await expect(ProductService.getAll(undefined, 'sales')).rejects.toThrow(
        'Nenhuma organização selecionada.'
      );
    });

    it('deve lançar quando organizationId é string vazia', async () => {
      await expect(ProductService.getAll('', 'sales')).rejects.toThrow(
        'Nenhuma organização selecionada.'
      );
    });

    it('deve lançar quando role é undefined', async () => {
      await expect(ProductService.getAll('org-1', undefined)).rejects.toThrow(
        'Usuário sem cargo.'
      );
    });

    it('deve chamar ProductAPI.getAllForSales quando role é sales', async () => {
      vi.mocked(ProductAPI.getAllForSales).mockResolvedValue([mockProduct]);
      const result = await ProductService.getAll('org-1', 'sales');
      expect(ProductAPI.getAllForSales).toHaveBeenCalledWith('org-1');
      expect(result).toEqual([mockProduct]);
    });

    it('deve chamar ProductAPI.getAllForInternals quando role é manager', async () => {
      vi.mocked(ProductAPI.getAllForInternals).mockResolvedValue([mockProduct]);
      await ProductService.getAll('org-1', 'manager');
      expect(ProductAPI.getAllForInternals).toHaveBeenCalledWith('org-1');
    });

    it('deve chamar ProductAPI.getAllForInternals quando role é owner', async () => {
      vi.mocked(ProductAPI.getAllForInternals).mockResolvedValue([mockProduct]);
      await ProductService.getAll('org-1', 'owner');
      expect(ProductAPI.getAllForInternals).toHaveBeenCalledWith('org-1');
    });

    it('deve propagar erros da API', async () => {
      vi.mocked(ProductAPI.getAllForSales).mockRejectedValue(
        new Error('Erro da API')
      );
      await expect(ProductService.getAll('org-1', 'sales')).rejects.toThrow(
        'Erro da API'
      );
    });
  });

  describe('getOneById', () => {
    it('deve lançar quando productId é undefined', async () => {
      await expect(ProductService.getOneById(undefined)).rejects.toThrow(
        'Produto não informado.'
      );
    });

    it('deve lançar quando productId é string vazia', async () => {
      await expect(ProductService.getOneById('')).rejects.toThrow(
        'Produto não informado.'
      );
    });

    it('deve chamar ProductAPI.getOneById com o id correto', async () => {
      vi.mocked(ProductAPI.getOneById).mockResolvedValue(mockProduct);
      const result = await ProductService.getOneById('p-1');
      expect(ProductAPI.getOneById).toHaveBeenCalledWith('p-1');
      expect(result).toEqual(mockProduct);
    });

    it('deve propagar erros da API', async () => {
      vi.mocked(ProductAPI.getOneById).mockRejectedValue(
        new Error('Produto não encontrado.')
      );
      await expect(ProductService.getOneById('p-1')).rejects.toThrow(
        'Produto não encontrado.'
      );
    });
  });

  describe('add', () => {
    it('deve lançar quando organizationId é undefined', async () => {
      await expect(ProductService.add({} as never, undefined)).rejects.toThrow(
        'Nenhuma organização selecionada.'
      );
    });

    it('deve lançar erro de validação Zod quando o produto é inválido', async () => {
      const input = {
        sku: '123',
        categories: [{ id: '1', name: 'Cat 1' }],
        stock: 10,
        minimumStock: 2,
        isActive: true,
        hasVariants: false
      } as never;
      await expect(ProductService.add(input, 'org-1')).rejects.toThrow();
    });

    it('deve chamar ProductAPI.add com o produto validado quando tudo está correto', async () => {
      vi.mocked(ProductAPI.add).mockResolvedValue(mockProduct);
      const input = {
        name: 'Produto A',
        sku: '123',
        categories: [{ id: '1', name: 'Cat 1' }],
        stock: 10,
        minimumStock: 2,
        isActive: true,
        hasVariants: false,
        variants: [],
        attributes: [],
        allImages: []
      } as never;
      await ProductService.add(input, 'org-1');
      expect(ProductAPI.add).toHaveBeenCalledWith(
        expect.objectContaining({ organizationId: 'org-1', name: 'Produto A' })
      );
    });
  });

  describe('update', () => {
    it('deve lançar quando organizationId é undefined', async () => {
      await expect(
        ProductService.update({} as never, undefined)
      ).rejects.toThrow('Nenhuma organização selecionada.');
    });

    it('deve lançar erro de validação quando o produto é inválido', async () => {
      const input = {
        id: 'p1',
        sku: '123',
        categories: [{ id: '1', name: 'Cat 1' }],
        stock: 10,
        minimumStock: 2,
        isActive: true,
        hasVariants: false
      } as never;
      await expect(ProductService.update(input, 'org-1')).rejects.toThrow();
    });

    it('deve chamar ProductAPI.update com o produto validado quando tudo está correto', async () => {
      vi.mocked(ProductAPI.update).mockResolvedValue(mockProduct);
      const input = {
        id: 'p-1',
        name: 'Produto A',
        sku: '123',
        categories: [{ id: '1', name: 'Cat 1' }],
        stock: 10,
        minimumStock: 2,
        isActive: true,
        hasVariants: false,
        variants: [],
        attributes: [],
        allImages: []
      } as never;
      await ProductService.update(input, 'org-1');
      expect(ProductAPI.update).toHaveBeenCalledWith(
        expect.objectContaining({ organizationId: 'org-1', id: 'p-1' })
      );
    });
  });
});
