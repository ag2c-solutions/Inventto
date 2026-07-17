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
    checkHasMovements: vi.fn(),
    setProductActive: vi.fn(),
    getImportCandidates: vi.fn(),
    importProducts: vi.fn(),
    getSourceProductVariants: vi.fn()
  }
}));

import { ProductAPI } from '../../data/api';
import {
  importCandidateFactory,
  importCandidateVariantFactory
} from '../../tests/factories/import-candidate.factory';
import { organizationFactory } from '../../tests/factories/organization.factory';
import {
  createProductFactory,
  createProductWithVariantsFactory,
  productFactory,
  updateProductFactory
} from '../../tests/factories/product.factory';

import { ProductService } from './index';

describe('ProductService', () => {
  const mockOrganization = organizationFactory.build({ id: 'org-1' });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAll', () => {
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
      const product = productFactory.build();
      vi.mocked(ProductAPI.getAllForSales).mockResolvedValue([product]);

      const result = await ProductService.getAll(mockOrganization, 'sales');

      expect(ProductAPI.getAllForSales).toHaveBeenCalledWith('org-1');
      expect(result).toEqual([product]);
    });

    it('deve chamar ProductAPI.getAllForInternals quando role é manager', async () => {
      vi.mocked(ProductAPI.getAllForInternals).mockResolvedValue([
        productFactory.build()
      ]);

      await ProductService.getAll(mockOrganization, 'manager');

      expect(ProductAPI.getAllForInternals).toHaveBeenCalledWith('org-1');
    });

    it('deve chamar ProductAPI.getAllForInternals quando role é owner', async () => {
      vi.mocked(ProductAPI.getAllForInternals).mockResolvedValue([
        productFactory.build()
      ]);

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
      const product = productFactory.build({ id: 'p-1' });
      vi.mocked(ProductAPI.getOneById).mockResolvedValue(product);

      const result = await ProductService.getOneById('p-1');

      expect(ProductAPI.getOneById).toHaveBeenCalledWith('p-1');
      expect(result).toEqual(product);
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
    it('deve lançar quando organization é null', async () => {
      const { organizationId: _organizationId, ...withoutOrg } =
        createProductFactory.build();

      await expect(ProductService.add(withoutOrg, null)).rejects.toThrow(
        'Nenhuma organização selecionada.'
      );

      expect(ProductAPI.add).not.toHaveBeenCalled();
    });

    it('deve chamar ProductAPI.add com o produto validado', async () => {
      const product = productFactory.build();
      vi.mocked(ProductAPI.add).mockResolvedValue(product);

      const { organizationId: _organizationId, ...withoutOrg } =
        createProductFactory.build();

      await ProductService.add(withoutOrg, mockOrganization);

      expect(ProductAPI.add).toHaveBeenCalledWith(
        expect.objectContaining({ organizationId: 'org-1' })
      );
    });

    it('deve validar produtos com variações corretamente', async () => {
      const product = productFactory.build();
      vi.mocked(ProductAPI.add).mockResolvedValue(product);

      const { organizationId: _organizationId, ...withoutOrg } =
        createProductWithVariantsFactory.build();

      await ProductService.add(withoutOrg, mockOrganization);

      expect(ProductAPI.add).toHaveBeenCalledWith(
        expect.objectContaining({ hasVariants: true })
      );
    });

    it('deve lançar erro de validação quando o produto é inválido', async () => {
      const { organizationId: _organizationId, ...withoutOrg } =
        createProductFactory.build({ name: '' });

      await expect(
        ProductService.add(withoutOrg, mockOrganization)
      ).rejects.toThrow();

      expect(ProductAPI.add).not.toHaveBeenCalled();
    });

    it('deve lançar erro de validação quando produto sem variações possui variantes', async () => {
      const invalidInput = {
        ...createProductFactory.build(),
        hasVariants: false,
        variants: createProductWithVariantsFactory.build().variants
      } as ReturnType<typeof createProductFactory.build>;
      const { organizationId: _organizationId, ...withoutOrg } = invalidInput;

      await expect(
        ProductService.add(withoutOrg, mockOrganization)
      ).rejects.toThrow();

      expect(ProductAPI.add).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('deve lançar quando organization é null', async () => {
      const { organizationId: _organizationId, ...withoutOrg } =
        updateProductFactory.build();

      await expect(ProductService.update(withoutOrg, null)).rejects.toThrow(
        'Nenhuma organização selecionada.'
      );

      expect(ProductAPI.update).not.toHaveBeenCalled();
    });

    it('deve lançar erro de validação quando o produto é inválido', async () => {
      const { organizationId: _organizationId, ...withoutOrg } =
        updateProductFactory.build({ name: '' });

      await expect(
        ProductService.update(withoutOrg, mockOrganization)
      ).rejects.toThrow();
    });

    it('deve chamar ProductAPI.update com o produto validado', async () => {
      const product = productFactory.build();
      vi.mocked(ProductAPI.update).mockResolvedValue(product);

      const { organizationId: _organizationId, ...withoutOrg } =
        updateProductFactory.build({ id: 'p-1' });

      await ProductService.update(withoutOrg, mockOrganization);

      expect(ProductAPI.update).toHaveBeenCalledWith(
        expect.objectContaining({ organizationId: 'org-1', id: 'p-1' })
      );
    });
  });

  describe('checkHasMovements', () => {
    it('deve retornar false quando productId não é informado', async () => {
      const result = await ProductService.checkHasMovements(undefined);

      expect(result).toBe(false);
      expect(ProductAPI.checkHasMovements).not.toHaveBeenCalled();
    });

    it('deve retornar false quando productId é string vazia', async () => {
      const result = await ProductService.checkHasMovements('');

      expect(result).toBe(false);
      expect(ProductAPI.checkHasMovements).not.toHaveBeenCalled();
    });

    it('deve chamar ProductAPI.checkHasMovements com o id informado', async () => {
      vi.mocked(ProductAPI.checkHasMovements).mockResolvedValue(true);

      const result = await ProductService.checkHasMovements('p-1');

      expect(ProductAPI.checkHasMovements).toHaveBeenCalledWith('p-1');
      expect(result).toBe(true);
    });
  });

  describe('changeStatus', () => {
    it('deve lançar quando productId não é informado', async () => {
      await expect(
        ProductService.changeStatus('', true, mockOrganization)
      ).rejects.toThrow('Produto não informado.');

      expect(ProductAPI.setProductActive).not.toHaveBeenCalled();
    });

    it('deve lançar quando organization é null', async () => {
      await expect(
        ProductService.changeStatus('p-1', true, null)
      ).rejects.toThrow('Nenhuma organização selecionada.');
    });

    it('deve chamar ProductAPI.setProductActive com os parâmetros corretos', async () => {
      vi.mocked(ProductAPI.setProductActive).mockResolvedValue(undefined);

      await ProductService.changeStatus('p-1', false, mockOrganization);

      expect(ProductAPI.setProductActive).toHaveBeenCalledWith(
        'p-1',
        'org-1',
        false
      );
    });
  });

  describe('getImportCandidates', () => {
    it('deve lançar quando a org destino é null', async () => {
      await expect(
        ProductService.getImportCandidates('org-2', null)
      ).rejects.toThrow('Nenhuma organização selecionada.');
    });

    it('deve lançar quando a origem não é informada', async () => {
      await expect(
        ProductService.getImportCandidates(undefined, mockOrganization)
      ).rejects.toThrow('Organização de origem não informada.');
    });

    it('deve lançar quando origem e destino são iguais', async () => {
      await expect(
        ProductService.getImportCandidates('org-1', mockOrganization)
      ).rejects.toThrow(
        'A organização de origem deve ser diferente da organização ativa.'
      );
    });

    it('deve chamar ProductAPI.getImportCandidates com origem e destino', async () => {
      const candidates = importCandidateFactory.buildList(2);
      vi.mocked(ProductAPI.getImportCandidates).mockResolvedValue(candidates);

      const result = await ProductService.getImportCandidates(
        'org-2',
        mockOrganization
      );

      expect(ProductAPI.getImportCandidates).toHaveBeenCalledWith(
        'org-2',
        'org-1'
      );
      expect(result).toEqual(candidates);
    });
  });

  describe('import', () => {
    it('deve lançar quando a org destino é null', async () => {
      await expect(
        ProductService.import('org-2', ['p-1'], null)
      ).rejects.toThrow('Nenhuma organização selecionada.');
      expect(ProductAPI.importProducts).not.toHaveBeenCalled();
    });

    it('deve lançar quando origem e destino são iguais', async () => {
      await expect(
        ProductService.import('org-1', ['p-1'], mockOrganization)
      ).rejects.toThrow(
        'A organização de origem deve ser diferente da organização ativa.'
      );
      expect(ProductAPI.importProducts).not.toHaveBeenCalled();
    });

    it('deve lançar quando nenhum produto é selecionado', async () => {
      await expect(
        ProductService.import('org-2', [], mockOrganization)
      ).rejects.toThrow('Selecione ao menos um produto para importar.');
      expect(ProductAPI.importProducts).not.toHaveBeenCalled();
    });

    it('deve chamar ProductAPI.importProducts e retornar a contagem', async () => {
      vi.mocked(ProductAPI.importProducts).mockResolvedValue(2);

      const result = await ProductService.import(
        'org-2',
        ['p-1', 'p-2'],
        mockOrganization
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
      const variants = [importCandidateVariantFactory.build()];
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
