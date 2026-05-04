import type { UserRole } from '@/features/users/types';
import { supabase } from '@/infra/supabase';

import type { ProductAttributeDTO, ProductDTO } from '../../types/dto';
import type { IProduct } from '../../types/models';
import { handleProductError } from '../handlers/product-error-handler';
import { ProductMapper } from '../mapper/product-mapper';
import { selectQuery, selectQueryForSales } from './queries';

export class ProductAPI {
  static async getAll(
    organizationId?: string,
    role?: UserRole
  ): Promise<IProduct[]> {
    if (!organizationId) throw new Error('Nenhuma organização selecionada.');
    if (!role) throw new Error('Usuário sem cargo.');

    if (role !== 'sales') {
      return ProductAPI.getAllForInternals(organizationId);
    }

    return ProductAPI.getAllForSales(organizationId);
  }

  static async getAllForInternals(organizationId: string): Promise<IProduct[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(selectQuery)
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false })
        .overrideTypes<ProductDTO[], { merge: false }>();

      if (error) throw error;

      return data.map(ProductMapper.toDomain);
    } catch (error) {
      handleProductError(error, 'getAll');
    }
  }

  static async getAllForSales(organizationId: string): Promise<IProduct[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(selectQueryForSales)
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
        .select(selectQuery)
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

      return [];
    }
  }

  static async add(params: IProduct): Promise<IProduct> {
    const product = ProductMapper.toPersistence(params);

    try {
      const { data, error } = await supabase.rpc('create_product', {
        product_data: product
      });

      if (error) throw error;

      return ProductAPI.getOneById(data);
    } catch (error) {
      handleProductError(error, 'add');
    }
  }

  static async update(params: IProduct): Promise<IProduct> {
    const product = ProductMapper.toPersistence(params);

    try {
      const { data, error } = await supabase.rpc('update_product', {
        product_data: product
      });

      if (error) throw error;

      return ProductAPI.getOneById(data);
    } catch (error) {
      handleProductError(error, 'update');
    }
  }
}
