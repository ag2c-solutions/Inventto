import { useUser } from '@/features/users';

import { DashboardShell } from '../../components/dashboard-shell';
import { GreetHeader } from '../../components/greet-header';

export function DashboardPage() {
  const { user, currentOrganization, role } = useUser();

  if (!user || !currentOrganization || !role) return null;

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
