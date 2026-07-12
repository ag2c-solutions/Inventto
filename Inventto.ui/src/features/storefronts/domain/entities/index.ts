export type StorefrontState = 'live' | 'inactive';

export interface Storefront {
  id: string;
  name: string;
  slug?: string;
  catalogId?: string;
  catalogName?: string;
  state: StorefrontState;
  // inventto.app/{slug} — ausente quando não há slug definido.
  publicUrl?: string;
}
