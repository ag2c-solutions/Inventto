import { useUser } from '@/features/users';

import { OnboardingService } from '../../../domain/services';
import { DashboardShell } from '../../components/dashboard-shell';
import { GreetHeader } from '../../components/greet-header';
import { Onboarding } from '../../components/onboarding';
import { useOnboardingStatusQuery } from '../../hooks/use-queries';

export function DashboardPage() {
  const { user, currentOrganization, role } = useUser();
  const { data: onboardingStatus, isLoading } = useOnboardingStatusQuery();

  if (!user || !currentOrganization || !role || isLoading) return null;

  // RN092/DASH-05: primeiro uso substitui os blocos operacionais pelo
  // onboarding guiado. Falha/undefined no status faz o dashboard cair no
  // caminho normal (fail-open) em vez de travar a página.
  if (
    onboardingStatus &&
    OnboardingService.shouldShowOnboarding(onboardingStatus)
  ) {
    return (
      <div className="px-1 py-6 md:px-6">
        <Onboarding status={onboardingStatus} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 px-1 py-6 md:px-6">
      <GreetHeader
        name={user.fullName.split(' ')[0]}
        organizationName={currentOrganization.name}
        role={role}
      />
      <DashboardShell role={role} />
    </div>
  );
}
