import type { UserRole } from '@/features/users/types';

import { supabase } from '@/infra/supabase';

import type { ProductAttributeDTO, ProductDTO } from '../types/dto';
import type { IProduct } from '../types/models';

import { handleProductError } from './error-handler';
import { ProductMapper } from './mapper';
import { selectQuery, selectQueryForSales } from './queries';

async function getAll(
  organizationId?: string,
  role?: UserRole
): Promise<IProduct[]> {
  if (!organizationId) throw new Error('Nenhuma organização selecionada.');
  if (!role) throw new Error('Usuário sem cargo.');

  if (role !== 'sales') {
    return getAllForInternals(organizationId);
  } else {
    return getAllForSales(organizationId);
  }
}

async function getAllForInternals(organizationId: string): Promise<IProduct[]> {
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

async function getAllForSales(organizationId: string): Promise<IProduct[]> {
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

async function getOneById(id: string): Promise<IProduct> {
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

async function getGlobalAttributes(): Promise<ProductAttributeDTO[]> {
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

async function add(params: IProduct): Promise<IProduct> {
  const product = ProductMapper.toPersistence(params);

  try {
    const { data, error } = await supabase.rpc('create_product', {
      product_data: product
    });

    if (error) throw error;

    return await getOneById(data);
  } catch (error) {
    handleProductError(error, 'add');
  }
}

async function update(params: IProduct): Promise<IProduct> {
  const product = ProductMapper.toPersistence(params);

  try {
    const { data, error } = await supabase.rpc('update_product', {
      product_data: product
    });

    if (error) throw error;

    return await getOneById(data);
  } catch (error) {
    handleProductError(error, 'update');
  }
}

export const ProductService = {
  getAll,
  getAllForSales,
  getOneById,
  getGlobalAttributes,
  add,
  update
};
