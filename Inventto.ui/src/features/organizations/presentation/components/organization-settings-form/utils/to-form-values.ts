import { formatDocument } from '@/shared/utils';

import type {
  DayOfWeek,
  OrganizationWithDetails
} from '../../../../domain/entities';
import {
  defaultSettingsValues,
  type OrganizationSettingsFormData
} from '../schema';

export function organizationToFormValues(
  organization: OrganizationWithDetails
): OrganizationSettingsFormData {
  const s = organization.settings;

  const schedule = Object.entries(s.schedule).reduce(
    (acc, [key, val]) => {
      acc[key as DayOfWeek] = {
        isOpen: val.isOpen,
        open: val.openTime,
        close: val.closeTime
      };
      return acc;
    },
    {} as OrganizationSettingsFormData['schedule']
  );

  return {
    name: s.identity?.displayName || organization.name,
    document: organization.document
      ? formatDocument(organization.document)
      : '',
    legalName: organization.legalName || '',
    identity: {
      logoUrl: s.identity?.logoUrl || ''
    },
    address: {
      zip: s.address?.zip || '',
      street: s.address?.street || '',
      number: s.address?.number || '',
      complement: s.address?.complement || '',
      district: s.address?.district || '',
      city: s.address?.city || '',
      state: s.address?.state || ''
    },
    operational: {
      timezone:
        s.operational?.timezone || defaultSettingsValues.operational.timezone
    },
    sales: {
      acceptOrdersOutsideHours: s.sales?.acceptOrdersOutsideHours ?? false
    },
    schedule
  };
}
