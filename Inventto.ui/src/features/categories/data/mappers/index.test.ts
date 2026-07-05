import { describe, expect, it } from 'vitest';

import { categoryDTOFactory } from '../../tests/factories/category.factory';

import { CategoryMapper } from './index';

describe('CategoryMapper.toDomain', () => {
  it('deve mapear corretamente id e name do DTO para o modelo de domínio', () => {
    const dto = categoryDTOFactory.build();

    const result = CategoryMapper.toDomain(dto);

    expect(result).toEqual({ id: dto.id, name: dto.name });
  });

  it('deve ignorar o campo organization_id presente no DTO', () => {
    const dto = categoryDTOFactory.build();

    const result = CategoryMapper.toDomain(dto);

    expect(result).not.toHaveProperty('organization_id');
  });

  it('deve mapear corretamente quando organization_id é undefined no DTO', () => {
    const dto = categoryDTOFactory.build({ organization_id: undefined });

    const result = CategoryMapper.toDomain(dto);

    expect(result).toEqual({ id: dto.id, name: dto.name });
  });
});
