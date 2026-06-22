import type { ViaCEPResponseDTO } from '../types';

export class ViaCEPService {
  private static readonly BASE_URL = 'https://viacep.com.br/ws';

  static async lookup(cep: string): Promise<ViaCEPResponseDTO | null> {
    const cleaned = cep.replace(/\D/g, '');
    if (cleaned.length !== 8) return null;

    try {
      const response = await fetch(`${this.BASE_URL}/${cleaned}/json/`);
      if (!response.ok) return null;

      const data = (await response.json()) as ViaCEPResponseDTO;
      if (data.erro) return null;

      return data;
    } catch {
      return null;
    }
  }
}
