export type StorefrontState = 'live' | 'inactive';

export interface Storefront {
  id: string;
  name: string;
  slug?: string;
  catalogId?: string;
  catalogName?: string;
  whatsapp?: string;
  instagram?: string;
  facebook?: string;
  website?: string;
  state: StorefrontState;
  // inventto.app/{slug} — ausente quando não há slug definido.
  publicUrl?: string;
}

export interface CreateStorefrontPayload {
  organizationId: string;
  name: string;
  catalogId?: string;
  slug?: string;
  whatsapp?: string;
  instagram?: string;
  facebook?: string;
  website?: string;
}

export interface UpdateStorefrontPayload {
  id: string;
  name: string;
  catalogId?: string;
  slug?: string;
  whatsapp?: string;
  instagram?: string;
  facebook?: string;
  website?: string;
}

export type SlugAvailabilityReason = 'ok' | 'taken' | 'invalid' | 'reserved';

export interface SlugAvailability {
  available: boolean;
  reason: SlugAvailabilityReason;
}

/**
 * Erro de domínio (RN072/RN073): o servidor recusou o slug (formato,
 * já em uso, ou em quarentena). A UI mapeia para o estado de erro do
 * SlugField em vez de um toast genérico.
 */
export class StorefrontSlugUnavailableError extends Error {
  readonly reason: SlugAvailabilityReason;

  constructor(reason: SlugAvailabilityReason) {
    super('Este endereço não está disponível.');
    this.name = 'StorefrontSlugUnavailableError';
    this.reason = reason;
  }
}

export type PublishPrereqKey = 'catalog' | 'whatsapp' | 'hours';

export interface PublishStorefrontResult {
  published: boolean;
  // Presente só quando published=false — chaves faltantes (RN075).
  missingPrereqs?: PublishPrereqKey[];
}

/**
 * Erro de domínio (RN075): o servidor recusou publicar por faltar algum
 * pré-requisito. A UI mapeia este erro para abrir o PublishDialog em vez
 * de mostrar um toast genérico.
 */
export class StorefrontPrereqsMissingError extends Error {
  readonly missing: PublishPrereqKey[];

  constructor(missing: PublishPrereqKey[]) {
    super('Faltam pré-requisitos para publicar esta vitrine.');
    this.name = 'StorefrontPrereqsMissingError';
    this.missing = missing;
  }
}
