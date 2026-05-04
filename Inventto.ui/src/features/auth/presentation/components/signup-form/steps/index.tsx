import type { WizardStep } from '@/shared/components/common/wizard';

import { OrganizationStep } from './organization-infos';
import { UserStep } from './user-infos';

export const steps: WizardStep[] = [
  {
    id: 'organization',
    label: 'Dados da Empresa',
    component: <OrganizationStep />
  },
  {
    id: 'user',
    label: 'Dados de Acesso',
    component: <UserStep />
  }
];
