import type { Role } from '@/features/permissions';

import type {
  DashboardRoleView,
  OnboardingStatus,
  OnboardingStep
} from '../entities';

export class DashboardService {
  static getRoleView(role: Role): DashboardRoleView {
    return {
      role,
      showSalesChart: role !== 'sales',
      showOwnerExtras: role === 'owner'
    };
  }
}

// RN092/DASH-05: 3 passos sequenciais que espelham os pré-requisitos reais
// de vender (produto → catálogo → vitrine publicada). Cada passo só fica
// "ativo" quando o anterior está concluído — não é papel-sensível.
const ONBOARDING_STEPS: Array<Omit<OnboardingStep, 'done' | 'active'>> = [
  {
    id: 'product',
    title: 'Cadastre seu primeiro produto',
    subtitle: 'Defina nome, SKU e estoque mínimo.',
    href: '/products/create'
  },
  {
    id: 'catalog',
    title: 'Crie um catálogo',
    subtitle: 'Defina o que você vende e por quanto.',
    href: '/catalogos'
  },
  {
    id: 'storefront',
    title: 'Publique sua vitrine',
    subtitle: 'Coloque sua loja online para receber pedidos.',
    href: '/storefronts'
  }
];

export class OnboardingService {
  static resolveSteps(status: OnboardingStatus): OnboardingStep[] {
    const doneFlags = [
      status.hasProducts,
      status.hasCatalog,
      status.hasPublishedStorefront
    ];

    let activeAssigned = false;

    return ONBOARDING_STEPS.map((step, index) => {
      const done = doneFlags[index];
      const active =
        !done && !activeAssigned && (index === 0 || doneFlags[index - 1]);

      if (active) activeAssigned = true;

      return { ...step, done, active };
    });
  }

  static isComplete(status: OnboardingStatus): boolean {
    return (
      status.hasProducts && status.hasCatalog && status.hasPublishedStorefront
    );
  }

  // RN092: onboarding some quando os 3 passos terminam OU quando já há
  // atividade operacional (venda realizada) mesmo com passos pendentes —
  // a loja já está "funcionando", não faz sentido travar no setup guiado.
  static shouldShowOnboarding(status: OnboardingStatus): boolean {
    return !status.hasSales && !this.isComplete(status);
  }
}
