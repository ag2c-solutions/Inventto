import { OrganizationSettingsForm } from '../components/organization-settings-form';
import { OrganizationSettingsFormSkeleton } from '../components/organization-settings-form/skeleton';
import { useOrganizationQuery } from '../hooks/use-queries';

export function SettingsPage() {
  const { isLoading } = useOrganizationQuery();

  // Sempre há dados — a tela abre em skeleton enquanto a organização carrega
  // (wireframe §02 · Estados da tela).
  if (isLoading) {
    return <OrganizationSettingsFormSkeleton />;
  }

  return <OrganizationSettingsForm />;
}
