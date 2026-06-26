import { type z } from 'zod';

import { getOrganizationId, type Organization } from '@/features/organizations';
import type { Role } from '@/features/permissions';

import { ProductAPI } from '../../data/api';
import {
  type CreateProduct,
  type ImportCandidate,
  type ImportCandidateVariant,
  type IProduct,
  type UpdateProduct
} from '../entities';
import { createProductSchema, updateProductSchema } from '../validators';

export class ProductService {
  static async getAll(
    organization: Organization | null,
    role?: Role
  ): Promise<IProduct[]> {
    const organizationId = getOrganizationId(organization);

    if (!role?.trim()) {
      throw new Error('Usuário sem cargo.');
    }

    if (role === 'sales') {
      return ProductAPI.getAllForSales(organizationId);
    }

    return ProductAPI.getAllForInternals(organizationId);
  }

  static async getOneById(productId?: string): Promise<IProduct> {
    if (!productId?.trim()) {
      throw new Error('Produto não informado.');
    }

    return ProductAPI.getOneById(productId);
  }

  static async add(
    product: Omit<CreateProduct, 'organizationId'>,
    organization: Organization | null
  ): Promise<IProduct> {
    const organizationId = getOrganizationId(organization);

    const validProduct = ProductService.validateCreateProduct({
      ...product,
      organizationId
    });

    return ProductAPI.add(validProduct);
  }

  static async update(
    product: Omit<UpdateProduct, 'organizationId'>,
    organization: Organization | null
  ): Promise<IProduct> {
    const organizationId = getOrganizationId(organization);

    const validProduct = ProductService.validateUpdateProduct({
      ...product,
      organizationId
    });

    return ProductAPI.update(validProduct);
  }

  static async checkHasMovements(productId?: string): Promise<boolean> {
    if (!productId?.trim()) {
      return false;
    }

    return ProductAPI.checkHasMovements(productId);
  }

  static async changeStatus(
    productId: string,
    isActive: boolean,
    organization: Organization | null
  ): Promise<void> {
    if (!productId?.trim()) {
      throw new Error('Produto não informado.');
    }

    const organizationId = getOrganizationId(organization);

    return ProductAPI.setProductActive(productId, organizationId, isActive);
  }

  static async getImportCandidates(
    sourceOrganizationId: string | undefined,
    targetOrganization: Organization | null
  ): Promise<ImportCandidate[]> {
    const targetOrganizationId = getOrganizationId(targetOrganization);

    if (!sourceOrganizationId?.trim()) {
      throw new Error('Organização de origem não informada.');
    }

    if (sourceOrganizationId === targetOrganizationId) {
      throw new Error(
        'A organização de origem deve ser diferente da organização ativa.'
      );
    }

    return ProductAPI.getImportCandidates(
      sourceOrganizationId,
      targetOrganizationId
    );
  }

  static async getSourceProductVariants(
    sourceOrganizationId: string | undefined,
    productId: string | undefined
  ): Promise<ImportCandidateVariant[]> {
    if (!sourceOrganizationId?.trim()) {
      throw new Error('Organização de origem não informada.');
    }

    if (!productId?.trim()) {
      throw new Error('Produto não informado.');
    }

    return ProductAPI.getSourceProductVariants(sourceOrganizationId, productId);
  }

  static async import(
    sourceOrganizationId: string,
    productIds: string[],
    targetOrganization: Organization | null
  ): Promise<number> {
    const targetOrganizationId = getOrganizationId(targetOrganization);

    if (!sourceOrganizationId?.trim()) {
      throw new Error('Organização de origem não informada.');
    }

    if (sourceOrganizationId === targetOrganizationId) {
      throw new Error(
        'A organização de origem deve ser diferente da organização ativa.'
      );
    }

    if (!productIds.length) {
      throw new Error('Selecione ao menos um produto para importar.');
    }

    return ProductAPI.importProducts({
      sourceOrganizationId,
      targetOrganizationId,
      productIds
    });
  }

  private static validateCreateProduct(product: CreateProduct): CreateProduct {
    const result = createProductSchema.safeParse(product);

    if (!result.success) {
      throw ProductService.toValidationError(result.error);
    }

    return result.data;
  }

  private static validateUpdateProduct(product: UpdateProduct): UpdateProduct {
    const result = updateProductSchema.safeParse(product);

    if (!result.success) {
      throw ProductService.toValidationError(result.error);
    }

    return result.data;
  }

  private static toValidationError(error: z.ZodError): Error {
    const firstIssue = error.issues[0];

    return new Error(firstIssue?.message ?? 'Produto inválido.');
  }
}
