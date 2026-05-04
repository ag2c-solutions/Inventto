import { CategoryApi } from '../../data/api';
import type { Category } from '../entities';

export interface CreateCategoryPayload {
  name: string;
  organizationId: string;
}

export class CategoryService {
  static async add(payload: CreateCategoryPayload): Promise<Category> {
    return CategoryApi.add(payload);
  }
}
