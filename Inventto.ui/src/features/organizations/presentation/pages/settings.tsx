import { OrganizationSettingsForm } from '../components/organization-settings-form';
import { OrganizationSettingsFormSkeleton } from '../components/organization-settings-form/skeleton';
import { useOrganizationQuery } from '../hooks/use-queries';

export function SettingsPage() {
  const { isLoading } = useOrganizationQuery();

  if (isLoading) {
    return <OrganizationSettingsFormSkeleton />;
  }

  return <OrganizationSettingsForm />;
}
