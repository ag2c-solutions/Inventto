import type { UserRole } from '@/features/users/types';

import { ProductAPI } from '../../data/api/product-api';
import type { ProductAttributeDTO } from '../../types/dto';
import type { IProduct } from '../../types/models';

export class ProductService {
  static getAll(organizationId?: string, role?: UserRole): Promise<IProduct[]> {
    return ProductAPI.getAll(organizationId, role);
  }

  static getOneById(id: string): Promise<IProduct> {
    return ProductAPI.getOneById(id);
  }

  static getGlobalAttributes(): Promise<ProductAttributeDTO[]> {
    return ProductAPI.getGlobalAttributes();
  }

  static add(params: IProduct): Promise<IProduct> {
    return ProductAPI.add(params);
  }

  static update(params: IProduct): Promise<IProduct> {
    return ProductAPI.update(params);
  }
}
