import { Factory } from 'fishery';

import type { OnboardingStatusDTO } from '../../data/dtos';
import type { OnboardingStatus } from '../../domain/entities';

export const onboardingStatusFactory = Factory.define<OnboardingStatus>(() => ({
  hasProducts: false,
  hasCatalog: false,
  hasPublishedStorefront: false,
  hasSales: false
}));

export const onboardingStatusDTOFactory = Factory.define<OnboardingStatusDTO>(
  () => ({
    has_products: false,
    has_catalog: false,
    has_published_storefront: false,
    has_sales: false
  })
);
