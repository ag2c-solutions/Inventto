import type { OrganizationSettings } from '@/features/organizations';

import { StorefrontApi } from '../../data/api';
import {
  type CreateStorefrontPayload,
  type PublishPrereqKey,
  type PublishStorefrontResult,
  StorefrontPrereqsMissingError,
  type UpdateStorefrontPayload,
  type UpdateStorefrontThemePayload
} from '../entities';
import type { StorefrontThemeFormValues } from '../validators';
import { removeConfirmationValidator } from '../validators';

export interface PublishPrereqCheckInput {
  catalogId?: string;
  whatsapp?: string;
  organizationSettings?: OrganizationSettings;
}

// Payload de save: o tema chega do form com File cru (logoFile/coverFile)
// em vez de URL — StorefrontService.save faz o upload antes de persistir.
export interface SaveStorefrontInput
  extends Omit<CreateStorefrontPayload, 'theme'> {
  theme?: StorefrontThemeFormValues;
}

export class StorefrontService {
  static async unpublish(id: string): Promise<void> {
    return StorefrontApi.setPublished(id, false);
  }

  // RN075: catálogo vinculado + WhatsApp definido no storefront + timezone
  // e ao menos um dia com horário definidos na organização.
  static getMissingPrereqs({
    catalogId,
    whatsapp,
    organizationSettings
  }: PublishPrereqCheckInput): PublishPrereqKey[] {
    const missing: PublishPrereqKey[] = [];

    if (!catalogId) missing.push('catalog');
    if (!whatsapp?.trim()) missing.push('whatsapp');

    const timezone = organizationSettings?.operational.timezone;
    const hasOpenDay = Object.values(organizationSettings?.schedule ?? {}).some(
      (day) => day.isOpen
    );

    if (!timezone?.trim() || !hasOpenDay) missing.push('hours');

    return missing;
  }

  static async publish(id: string): Promise<PublishStorefrontResult> {
    try {
      await StorefrontApi.publishStorefront(id);
      return { published: true };
    } catch (error) {
      if (error instanceof StorefrontPrereqsMissingError) {
        return { published: false, missingPrereqs: error.missing };
      }
      throw error;
    }
  }

  static async remove(
    id: string,
    confirmation: string,
    expectedName: string
  ): Promise<void> {
    if (!removeConfirmationValidator(confirmation, expectedName)) {
      throw new Error('Digite o nome exato da vitrine para confirmar.');
    }

    return StorefrontApi.removeStorefront(id);
  }

  // ORG-02: se houver File cru (logo/capa recém-selecionados), sobe pro
  // Cloudinary antes de persistir; URLs já existentes passam direto.
  static async uploadThemeAssets(
    theme: StorefrontThemeFormValues
  ): Promise<UpdateStorefrontThemePayload> {
    const logoUrl = theme.logoFile
      ? await StorefrontApi.uploadLogo(theme.logoFile)
      : theme.logoUrl;
    const coverUrl = theme.coverFile
      ? await StorefrontApi.uploadCover(theme.coverFile)
      : theme.coverUrl;

    return {
      colors: theme.colors,
      logoUrl,
      coverUrl,
      layout: theme.layout,
      cardStyle: theme.cardStyle
    };
  }

  // Rascunho sem catálogo/WhatsApp é permitido — publicar é que exige
  // pré-requisitos completos (RN075, getMissingPrereqs acima).
  static async save(input: SaveStorefrontInput, id?: string): Promise<string> {
    const { theme: themeForm, ...rest } = input;
    const theme = themeForm
      ? await this.uploadThemeAssets(themeForm)
      : undefined;
    const payload: CreateStorefrontPayload = { ...rest, theme };

    if (id) {
      const updatePayload: UpdateStorefrontPayload = { id, ...payload };
      await StorefrontApi.updateStorefront(updatePayload);
      return id;
    }

    return StorefrontApi.createStorefront(payload);
  }

  // RN077/RN059: só é possível destacar produto que está no catálogo
  // vinculado a esta vitrine — a RPC também valida, mas falhar cedo aqui
  // evita um round-trip pra um erro que a UI já sabe ser inválido (a lista
  // de destacáveis já vem filtrada pelo catálogo).
  static async setFeature(
    storefrontId: string,
    productId: string,
    variantId: string | undefined,
    on: boolean,
    catalogProductIds: string[]
  ): Promise<void> {
    if (on && !catalogProductIds.includes(productId)) {
      throw new Error(
        'Este produto não pertence ao catálogo vinculado a esta vitrine.'
      );
    }

    return StorefrontApi.setFeature(storefrontId, productId, variantId, on);
  }
}
