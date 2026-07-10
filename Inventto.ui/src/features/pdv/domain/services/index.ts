import { PdvApi } from '../../data/api';

export class PdvService {
  static async setPdvCatalog(catalogId: string): Promise<void> {
    if (!catalogId) {
      throw new Error('Selecione um catálogo para vincular ao PDV.');
    }

    return PdvApi.setPdvCatalog(catalogId);
  }
}
