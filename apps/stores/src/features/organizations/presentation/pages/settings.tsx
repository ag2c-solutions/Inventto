import { OrganizationSettingsForm } from '../components/forms/organization-settings';
import { OrganizationSettingsFormSkeleton } from '../components/forms/organization-settings/pieces/skeleton';
import { useOrganizationQuery } from '../hooks/use-queries';

export function SettingsPage() {
  const { isLoading } = useOrganizationQuery();

  if (isLoading) {
    return <OrganizationSettingsFormSkeleton />;
  }

  return <OrganizationSettingsForm />;
}
