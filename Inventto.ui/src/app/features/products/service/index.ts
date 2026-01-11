import { supabase } from '@/app/config/supabase';
import { handleProductError } from './error-handler';
import { ProductMapper } from './mapper';
import type { IProduct } from '../types/models';
import type { ProductAttributeDTO, ProductDTO } from '../types/dto';
import { selectQuery } from './queries';

async function getAll(): Promise<IProduct[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select(selectQuery)
      .order('created_at', { ascending: false })
      .overrideTypes<ProductDTO[], { merge: false }>();

    if (error) throw error;

    return data.map(ProductMapper.toDomain);
  } catch (error) {
    handleProductError(error, 'getAll');
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
  getOneById,
  getGlobalAttributes,
  add,
  update
};
