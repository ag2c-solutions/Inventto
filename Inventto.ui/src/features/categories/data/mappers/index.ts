import type { Category } from '../../domain/entities';
import type { CategoryDTO } from '../dtos';

export class CategoryMapper {
  static toDomain(dto: CategoryDTO): Category {
    return {
      id: dto.id,
      name: dto.name
    };
  }
}
