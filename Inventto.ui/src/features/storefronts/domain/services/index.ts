import { StorefrontApi } from '../../data/api';

export class StorefrontService {
  static async unpublish(id: string): Promise<void> {
    return StorefrontApi.setPublished(id, false);
  }
}
