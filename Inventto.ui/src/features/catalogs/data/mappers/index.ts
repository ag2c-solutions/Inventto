import type {
  Catalog,
  CreateCatalogPayload,
  UpdateCatalogPayload
} from '../../domain/entities';
import type { CatalogDTO } from '../dtos';

export class CatalogMapper {
  static toDomain(dto: CatalogDTO): Catalog {
    return {
      id: dto.id,
      organizationId: dto.organization_id,
      name: dto.name,
      createdAt: new Date(dto.created_at),
      updatedAt: new Date(dto.updated_at),
      productsCount: dto.catalog_items?.[0]?.count ?? 0,
      // Fonte de vínculo (storefronts/PDV) ainda não existe — Módulo 8/7.
      channelsCount: 0
    };
  }

  static toPersistence(
    payload: Partial<CreateCatalogPayload & UpdateCatalogPayload>
  ): Partial<Pick<CatalogDTO, 'organization_id' | 'name'>> {
    return {
      organization_id: payload.organizationId,
      name: payload.name
    };
  }
}
