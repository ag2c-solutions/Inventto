import { supabase } from '@/infra/supabase';

import type {
  CreateProduct,
  ImportCandidate,
  ImportCandidateVariant,
  IProduct,
  IProductAttribute,
  UpdateProduct
} from '../../domain/entities';
import { SELECT_QUERY_INTERNALS } from '../constants/select-query-internals';
import type {
  ImportCandidateDTO,
  ProductAttributeDTO,
  ProductDTO,
  SourceVariantDTO
} from '../dtos';
import { handleProductError } from '../handlers/error-handler';
import { ProductMapper } from '../mappers';

export class ProductAPI {
  static async getAllForInternals(organizationId: string): Promise<IProduct[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(SELECT_QUERY_INTERNALS)
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false })
        .overrideTypes<ProductDTO[], { merge: false }>();

      if (error) throw error;

      return data.map(ProductMapper.toDomain);
    } catch (error) {
      handleProductError(error, 'getAllForInternals');
    }
  }

  // PROD-10 · RN057: a RLS de products/product_variants é Manager/Owner — o papel
  // Sales lê pela RPC sanitizada (mesmo shape dos embeds, sem cost_price).
  static async getAllForSales(organizationId: string): Promise<IProduct[]> {
    try {
      const { data, error } = await supabase.rpc('get_products_for_sales', {
        p_org_id: organizationId
      });

      if (error) throw error;

      const products = (data ?? []) as ProductDTO[];

      return products.map(ProductMapper.toDomain);
    } catch (error) {
      handleProductError(error, 'getAllForSales');
    }
  }

  static async getOneById(id: string): Promise<IProduct> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(SELECT_QUERY_INTERNALS)
        .eq('id', id)
        .single()
        .overrideTypes<ProductDTO, { merge: false }>();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new Error('Produto não encontrado.');
        }

        throw error;
      }

      return ProductMapper.toDomain(data);
    } catch (error) {
      handleProductError(error, 'getOneById');
    }
  }

  static async getGlobalAttributes(): Promise<IProductAttribute[]> {
    try {
      const { data, error } = await supabase
        .from('organization_attributes')
        .select('id, label, slug, type, values')
        .order('label', { ascending: true })
        .overrideTypes<ProductAttributeDTO[], { merge: false }>();

      if (error) throw error;

      return ProductMapper.toDomainAttributeList(data);
    } catch (error) {
      handleProductError(error, 'getGlobalAttributes');
    }
  }

  static async checkSkuAvailability(params: {
    organizationId: string;
    sku: string;
    excludeProductId?: string;
  }): Promise<boolean> {
    const { organizationId, sku, excludeProductId } = params;

    try {
      const { data, error } = await supabase.rpc(
        'check_product_sku_available',
        {
          p_organization_id: organizationId,
          p_sku: sku,
          p_exclude_product_id: excludeProductId ?? null
        }
      );

      if (error) throw error;

      return Boolean(data);
    } catch (error) {
      handleProductError(error, 'checkSkuAvailability');
    }
  }

  static async add(product: CreateProduct): Promise<IProduct> {
    const productData = ProductMapper.toPersistence(product);

    try {
      const { data, error } = await supabase.rpc('create_product', {
        product_data: productData
      });

      if (error) throw error;

      return ProductAPI.getOneById(data);
    } catch (error) {
      handleProductError(error, 'add');
    }
  }

  static async update(product: UpdateProduct): Promise<IProduct> {
    const productData = ProductMapper.toPersistence(product);

    try {
      const { data, error } = await supabase.rpc('update_product', {
        product_data: productData
      });

      if (error) throw error;

      return ProductAPI.getOneById(data);
    } catch (error) {
      handleProductError(error, 'update');
    }
  }

  static async checkHasMovements(productId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc(
        'check_product_has_movements',
        {
          p_product_id: productId
        }
      );

      if (error) throw error;

      return Boolean(data);
    } catch (error) {
      handleProductError(error, 'checkHasMovements');
    }
  }

  static async getImportCandidates(
    sourceOrganizationId: string,
    targetOrganizationId: string
  ): Promise<ImportCandidate[]> {
    try {
      const { data, error } = await supabase.rpc('get_import_candidates', {
        p_source_org_id: sourceOrganizationId,
        p_target_org_id: targetOrganizationId
      });

      if (error) throw error;

      const candidates = (data ?? []) as ImportCandidateDTO[];

      return candidates.map((candidate) => ({
        id: candidate.id,
        name: candidate.name,
        sku: candidate.sku,
        alreadyImported: candidate.already_imported,
        imageUrl: candidate.image_url ?? undefined,
        imagePublicId: candidate.image_public_id ?? undefined,
        variantCount: candidate.variant_count ?? 0
      }));
    } catch (error) {
      handleProductError(error, 'getImportCandidates');
    }
  }

  static async getSourceProductVariants(
    sourceOrganizationId: string,
    productId: string
  ): Promise<ImportCandidateVariant[]> {
    try {
      const { data, error } = await supabase.rpc(
        'get_source_product_variants',
        {
          p_source_org_id: sourceOrganizationId,
          p_product_id: productId
        }
      );

      if (error) throw error;

      const variants = (data ?? []) as SourceVariantDTO[];

      return variants.map((variant) => ({
        id: variant.id,
        sku: variant.sku,
        options: variant.options ?? [],
        imageUrl: variant.image_url ?? undefined,
        imagePublicId: variant.image_public_id ?? undefined
      }));
    } catch (error) {
      handleProductError(error, 'getSourceProductVariants');
    }
  }

  static async importProducts(params: {
    sourceOrganizationId: string;
    targetOrganizationId: string;
    productIds: string[];
  }): Promise<number> {
    const { sourceOrganizationId, targetOrganizationId, productIds } = params;

    try {
      const { data, error } = await supabase.rpc('import_products', {
        p_source_org_id: sourceOrganizationId,
        p_target_org_id: targetOrganizationId,
        p_product_ids: productIds
      });

      if (error) throw error;

      return Number(data ?? 0);
    } catch (error) {
      handleProductError(error, 'importProducts');
    }
  }

  static async setProductActive(
    productId: string,
    organizationId: string,
    isActive: boolean
  ): Promise<void> {
    try {
      const { error } = await supabase.rpc('set_product_active', {
        p_product_id: productId,
        p_organization_id: organizationId,
        p_is_active: isActive
      });

      if (error) throw error;
    } catch (error) {
      handleProductError(error, 'setProductActive');
    }
  }
}
