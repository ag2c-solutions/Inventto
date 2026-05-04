import { supabase } from '@/infra/supabase';

import type { Category } from '../../domain/entities';
import type { CreateCategoryPayload } from '../../domain/services';
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

      if (error) {
        handleCategoryError(error, 'add');
      }

      if (!data) {
        throw new Error('Erro inesperado: Categoria não retornada.');
      }

      return CategoryMapper.toDomain(data);
    } catch (error) {
      // Relança erros que já foram tratados (mensagens legíveis para o usuário)
      if (error instanceof Error) throw error;
      handleCategoryError(error, 'add');
    }
  }
}
