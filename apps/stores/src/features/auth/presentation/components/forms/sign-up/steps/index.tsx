import type { WizardStep } from '@/shared/components/common/wizard';

import { OrganizationStep } from './organization-infos';
import { UserStep } from './user-infos';
import { VerificationStep } from './verification';

export const steps: WizardStep[] = [
  {
    id: 'organization',
    label: 'Dados da Organização',
    component: <OrganizationStep />
  },
  {
    id: 'user',
    label: 'Dados de Acesso',
    component: <UserStep />,
    nextLabel: 'Continuar',
    nextHint:
      'Em seguida, enviaremos um código de verificação para o seu e-mail.'
  },
  {
    id: 'verification',
    label: 'Verificação',
    component: <VerificationStep />,
    hideControls: true
  }
];
