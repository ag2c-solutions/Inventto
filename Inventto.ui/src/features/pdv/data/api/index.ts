import { supabase } from '@/infra/supabase';

import type { PdvCatalog, PdvProduct } from '../../domain/entities';
import type { PdvCatalogItemDTO, PdvOrgCatalogDTO } from '../dtos';
import { handlePdvError } from '../handlers/error-handler';
import { PdvCatalogMapper, PdvProductMapper } from '../mappers';

const ITEM_SELECT_QUERY = `
  id,
  product_id,
  variant_id,
  price,
  product:products(
    id,
    name,
    sku,
    stock,
    product_images(url, is_primary),
    categories:product_categories(category:categories(id))
  ),
  variant:product_variants(
    id,
    sku,
    stock,
    options
  )
`;

export class PdvApi {
  static async getPdvCatalog(
    organizationId: string
  ): Promise<PdvCatalog | null> {
    try {
      const { data, error } = await supabase
        .from('organizations')
        // organizations<->catalogs tem 2 FKs (pdv_catalog_id e catalogs.organization_id);
        // sem o hint, o PostgREST retorna 300 Multiple Choices por ambiguidade.
        .select(
          'pdv_catalog_id, catalog:catalogs!organizations_pdv_catalog_id_fkey(id, name)'
        )
        .eq('id', organizationId)
        .single()
        .overrideTypes<PdvOrgCatalogDTO, { merge: false }>();

      if (error) throw error;

      return PdvCatalogMapper.toDomain(data);
    } catch (error) {
      handlePdvError(error, 'getPdvCatalog');
    }
  }

  static async getPdvProducts(catalogId: string): Promise<PdvProduct[]> {
    try {
      const { data, error } = await supabase
        .from('catalog_items')
        .select(ITEM_SELECT_QUERY)
        .eq('catalog_id', catalogId)
        .overrideTypes<PdvCatalogItemDTO[], { merge: false }>();

      if (error) throw error;

      return data.map(PdvProductMapper.toDomain);
    } catch (error) {
      handlePdvError(error, 'getPdvProducts');
    }
  }

  static async setPdvCatalog(catalogId: string): Promise<void> {
    try {
      const { error } = await supabase.rpc('set_pdv_catalog', {
        p_catalog_id: catalogId
      });

      if (error) throw error;
    } catch (error) {
      handlePdvError(error, 'setPdvCatalog');
    }
  }
}
