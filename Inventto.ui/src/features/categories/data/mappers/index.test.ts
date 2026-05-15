import { describe, expect, it } from 'vitest';

import type { CategoryDTO } from '../dtos';

import { CategoryMapper } from './index';

describe('CategoryMapper.toDomain', () => {
  it('deve mapear corretamente id e name do DTO para o modelo de domínio', () => {
    const dto: CategoryDTO = {
      id: 'c1',
      name: 'Roupas',
      organization_id: 'org-1'
    };

    const result = CategoryMapper.toDomain(dto);

    expect(result).toEqual({ id: 'c1', name: 'Roupas' });
  });

  it('deve ignorar o campo organization_id presente no DTO', () => {
    const dto: CategoryDTO = {
      id: 'c2',
      name: 'Calçados',
      organization_id: 'org-2'
    };

    const result = CategoryMapper.toDomain(dto);

    expect(result).not.toHaveProperty('organization_id');
  });

  it('deve mapear corretamente quando organization_id é undefined no DTO', () => {
    const dto: CategoryDTO = { id: 'c3', name: 'Acessórios' };

    const result = CategoryMapper.toDomain(dto);

    expect(result).toEqual({ id: 'c3', name: 'Acessórios' });
  });
});
