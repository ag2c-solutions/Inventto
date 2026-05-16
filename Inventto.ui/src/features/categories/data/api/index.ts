import { supabase } from '@/infra/supabase';

import type { Category, CreateCategoryPayload } from '../../domain/entities';
import type { CategoryDTO } from '../dtos';
import { handleCategoryError } from '../handlers/error-handler';
import { CategoryMapper } from '../mappers';

export class CategoryApi {
  static async getAll(): Promise<Category[]> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name')
        .order('name', { ascending: true })
        .overrideTypes<Array<CategoryDTO>, { merge: false }>();

      if (error) throw error;

      return (data ?? []).map(CategoryMapper.toDomain);
    } catch (error) {
      handleCategoryError(error, 'getAll');
    }
  }

  static async add({
    name,
    organizationId
  }: CreateCategoryPayload): Promise<Category> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert({ name, organization_id: organizationId })
        .select('id, name')
        .single()
        .overrideTypes<CategoryDTO, { merge: false }>();

      if (error) throw error;

      if (!data) {
        throw new Error('Erro inesperado: Categoria não retornada.');
      }

      return CategoryMapper.toDomain(data);
    } catch (error) {
      handleCategoryError(error, 'add');
    }
  }
}
