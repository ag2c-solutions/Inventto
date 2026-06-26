import { supabase } from '@/infra/supabase';

import type {
  CreateProduct,
  IProduct,
  UpdateProduct
} from '../../domain/entities';
import { SELECT_QUERY_INTERNALS } from '../constants/select-query-internals';
import { SELECT_QUERY_SALES } from '../constants/select-query-sales';
import type { ProductAttributeDTO, ProductDTO } from '../dtos';
import { handleProductError } from '../handlers/error-handler';
import { ProductMapper } from '../mapper';

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

  static async getAllForSales(organizationId: string): Promise<IProduct[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(SELECT_QUERY_SALES)
        .eq('organization_id', organizationId)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .overrideTypes<ProductDTO[], { merge: false }>();

      if (error) throw error;

      return data.map(ProductMapper.toDomain);
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

  static async getGlobalAttributes(): Promise<ProductAttributeDTO[]> {
    try {
      const { data, error } = await supabase
        .from('attributes')
        .select('id, label, slug, type, values')
        .order('label', { ascending: true })
        .overrideTypes<ProductAttributeDTO[], { merge: false }>();

      if (error) throw error;

      return data;
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
}
