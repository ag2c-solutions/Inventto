import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/features/organizations', () => ({
  getOrganizationId: vi.fn((org) => {
    if (!org?.id) throw new Error('Nenhuma organização selecionada.');
    return org.id;
  })
}));

vi.mock('../../data/api', () => ({
  ProductAPI: {
    getAllForSales: vi.fn(),
    getAllForInternals: vi.fn(),
    getOneById: vi.fn(),
    add: vi.fn(),
    update: vi.fn(),
    getImportCandidates: vi.fn(),
    importProducts: vi.fn(),
    getSourceProductVariants: vi.fn()
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
    const mockOrganization = {
      id: 'org-1',
      name: 'Inventto',
      slug: 'inventto',
      role: 'owner' as const
    };

    it('deve lançar quando organization é null', async () => {
      await expect(ProductService.getAll(null, 'sales')).rejects.toThrow(
        'Nenhuma organização selecionada.'
      );
    });

    it('deve lançar quando role é undefined', async () => {
      await expect(
        ProductService.getAll(mockOrganization, undefined)
      ).rejects.toThrow('Usuário sem cargo.');
    });

    it('deve chamar ProductAPI.getAllForSales quando role é sales', async () => {
      vi.mocked(ProductAPI.getAllForSales).mockResolvedValue([mockProduct]);

      const result = await ProductService.getAll(mockOrganization, 'sales');

      expect(ProductAPI.getAllForSales).toHaveBeenCalledWith('org-1');
      expect(result).toEqual([mockProduct]);
    });

    it('deve chamar ProductAPI.getAllForInternals quando role é manager', async () => {
      vi.mocked(ProductAPI.getAllForInternals).mockResolvedValue([mockProduct]);

      await ProductService.getAll(mockOrganization, 'manager');

      expect(ProductAPI.getAllForInternals).toHaveBeenCalledWith('org-1');
    });

    it('deve chamar ProductAPI.getAllForInternals quando role é owner', async () => {
      vi.mocked(ProductAPI.getAllForInternals).mockResolvedValue([mockProduct]);

      await ProductService.getAll(mockOrganization, 'owner');

      expect(ProductAPI.getAllForInternals).toHaveBeenCalledWith('org-1');
    });

    it('deve propagar erros da API', async () => {
      vi.mocked(ProductAPI.getAllForSales).mockRejectedValue(
        new Error('Erro da API')
      );

      await expect(
        ProductService.getAll(mockOrganization, 'sales')
      ).rejects.toThrow('Erro da API');
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
    const mockOrganization = {
      id: 'org-1',
      name: 'Inventto',
      slug: 'inventto',
      role: 'owner' as const
    };

    it('deve lançar quando organization é null', async () => {
      await expect(
        ProductService.add({ name: 'Produto A' } as never, null)
      ).rejects.toThrow('Nenhuma organização selecionada.');

      expect(ProductAPI.add).not.toHaveBeenCalled();
    });

    it('deve chamar ProductAPI.add com o produto validado', async () => {
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

      await ProductService.add(input, mockOrganization);

      expect(ProductAPI.add).toHaveBeenCalledWith(
        expect.objectContaining({ organizationId: 'org-1' })
      );
    });

    it('deve lançar erro de validação quando o produto é inválido', async () => {
      const input = {
        sku: '123',
        categories: [{ id: '1', name: 'Cat 1' }],
        stock: 10,
        minimumStock: 2,
        isActive: true,
        hasVariants: false
      } as never;

      await expect(
        ProductService.add(input, mockOrganization)
      ).rejects.toThrow();

      expect(ProductAPI.add).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    const mockOrganization = {
      id: 'org-1',
      name: 'Inventto',
      slug: 'inventto',
      role: 'owner' as const
    };

    it('deve lançar quando organization é null', async () => {
      await expect(
        ProductService.update({ id: 'p-1' } as never, null)
      ).rejects.toThrow('Nenhuma organização selecionada.');

      expect(ProductAPI.update).not.toHaveBeenCalled();
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

      await expect(
        ProductService.update(input, mockOrganization)
      ).rejects.toThrow();
    });

    it('deve chamar ProductAPI.update com o produto validado', async () => {
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

      await ProductService.update(input, mockOrganization);

      expect(ProductAPI.update).toHaveBeenCalledWith(
        expect.objectContaining({ organizationId: 'org-1', id: 'p-1' })
      );
    });
  });

  describe('getImportCandidates', () => {
    const targetOrg = { id: 'org-1', name: 'Destino' } as never;

    it('deve lançar quando a org destino é null', async () => {
      await expect(
        ProductService.getImportCandidates('org-2', null)
      ).rejects.toThrow('Nenhuma organização selecionada.');
    });

    it('deve lançar quando a origem não é informada', async () => {
      await expect(
        ProductService.getImportCandidates(undefined, targetOrg)
      ).rejects.toThrow('Organização de origem não informada.');
    });

    it('deve lançar quando origem e destino são iguais', async () => {
      await expect(
        ProductService.getImportCandidates('org-1', targetOrg)
      ).rejects.toThrow(
        'A organização de origem deve ser diferente da organização ativa.'
      );
    });

    it('deve chamar ProductAPI.getImportCandidates com origem e destino', async () => {
      const candidates = [
        {
          id: 'p-1',
          name: 'A',
          sku: 'A1',
          alreadyImported: false,
          variantCount: 0
        }
      ];
      vi.mocked(ProductAPI.getImportCandidates).mockResolvedValue(candidates);

      const result = await ProductService.getImportCandidates(
        'org-2',
        targetOrg
      );

      expect(ProductAPI.getImportCandidates).toHaveBeenCalledWith(
        'org-2',
        'org-1'
      );
      expect(result).toEqual(candidates);
    });
  });

  describe('import', () => {
    const targetOrg = { id: 'org-1', name: 'Destino' } as never;

    it('deve lançar quando a org destino é null', async () => {
      await expect(
        ProductService.import('org-2', ['p-1'], null)
      ).rejects.toThrow('Nenhuma organização selecionada.');
      expect(ProductAPI.importProducts).not.toHaveBeenCalled();
    });

    it('deve lançar quando origem e destino são iguais', async () => {
      await expect(
        ProductService.import('org-1', ['p-1'], targetOrg)
      ).rejects.toThrow(
        'A organização de origem deve ser diferente da organização ativa.'
      );
      expect(ProductAPI.importProducts).not.toHaveBeenCalled();
    });

    it('deve lançar quando nenhum produto é selecionado', async () => {
      await expect(
        ProductService.import('org-2', [], targetOrg)
      ).rejects.toThrow('Selecione ao menos um produto para importar.');
      expect(ProductAPI.importProducts).not.toHaveBeenCalled();
    });

    it('deve chamar ProductAPI.importProducts e retornar a contagem', async () => {
      vi.mocked(ProductAPI.importProducts).mockResolvedValue(2);

      const result = await ProductService.import(
        'org-2',
        ['p-1', 'p-2'],
        targetOrg
      );

      expect(ProductAPI.importProducts).toHaveBeenCalledWith({
        sourceOrganizationId: 'org-2',
        targetOrganizationId: 'org-1',
        productIds: ['p-1', 'p-2']
      });
      expect(result).toBe(2);
    });
  });

  describe('getSourceProductVariants', () => {
    it('deve lançar quando a origem não é informada', async () => {
      await expect(
        ProductService.getSourceProductVariants(undefined, 'p-1')
      ).rejects.toThrow('Organização de origem não informada.');
      expect(ProductAPI.getSourceProductVariants).not.toHaveBeenCalled();
    });

    it('deve lançar quando o produto não é informado', async () => {
      await expect(
        ProductService.getSourceProductVariants('org-2', '')
      ).rejects.toThrow('Produto não informado.');
      expect(ProductAPI.getSourceProductVariants).not.toHaveBeenCalled();
    });

    it('deve chamar ProductAPI.getSourceProductVariants com origem e produto', async () => {
      const variants = [{ id: 'v-1', sku: 'SKU-1', options: [] }];
      vi.mocked(ProductAPI.getSourceProductVariants).mockResolvedValue(
        variants
      );

      const result = await ProductService.getSourceProductVariants(
        'org-2',
        'p-1'
      );

      expect(ProductAPI.getSourceProductVariants).toHaveBeenCalledWith(
        'org-2',
        'p-1'
      );
      expect(result).toEqual(variants);
    });
  });
});
