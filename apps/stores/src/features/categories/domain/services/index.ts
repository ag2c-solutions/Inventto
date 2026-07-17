import { CategoryApi } from '../../data/api';
import type { Category, CreateCategoryPayload } from '../entities';

export class CategoryService {
  static async add(payload: CreateCategoryPayload): Promise<Category> {
    if (!payload.organizationId?.trim()) {
      throw new Error('Nenhuma organização selecionada.');
    }

    return CategoryApi.add(payload);
  }
}
