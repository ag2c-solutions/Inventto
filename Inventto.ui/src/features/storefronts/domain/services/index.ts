import type { OrganizationSettings } from '@/features/organizations';

import { StorefrontApi } from '../../data/api';
import {
  type PublishPrereqKey,
  type PublishStorefrontResult,
  StorefrontPrereqsMissingError
} from '../entities';
import { removeConfirmationValidator } from '../validators';

export interface PublishPrereqCheckInput {
  catalogId?: string;
  whatsapp?: string;
  organizationSettings?: OrganizationSettings;
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
}
