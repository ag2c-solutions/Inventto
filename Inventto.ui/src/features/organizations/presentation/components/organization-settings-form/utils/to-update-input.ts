import type {
  DayOfWeek,
  IBusinessSchedule,
  UpdateOrganizationInput
} from '../../../../domain/entities';
import type { OrganizationSettingsFormData } from '../schema';

export function formValuesToUpdateInput(
  data: OrganizationSettingsFormData
): UpdateOrganizationInput {
  const schedule = Object.entries(data.schedule).reduce(
    (acc, [key, val]) => {
      acc[key as DayOfWeek] = {
        isOpen: val.isOpen,
        openTime: val.open || '',
        closeTime: val.close || ''
      };
      return acc;
    },
    {} as Record<DayOfWeek, IBusinessSchedule>
  );

  const hasAddress = Object.values(data.address).some((v) => v?.trim());

  return {
    name: data.name,
    document: data.document?.trim() || null,
    legalName: data.legalName?.trim() || null,
    logoFile: data.identity.logoFile,
    settings: {
      identity: {
        displayName: data.name,
        logoUrl: data.identity.logoUrl || undefined
      },
      operational: {
        timezone: data.operational.timezone
      },
      sales: data.sales,
      schedule,
      address: hasAddress
        ? {
            zip: data.address.zip || '',
            street: data.address.street || '',
            number: data.address.number || '',
            complement: data.address.complement || undefined,
            district: data.address.district || '',
            city: data.address.city || '',
            state: data.address.state || ''
          }
        : undefined
    }
  };
}
