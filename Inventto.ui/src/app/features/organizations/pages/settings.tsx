import { OrganizationSettingsForm } from "../components/organization-settings-form";
import { PageHeader } from "@/app/components/shared/page-header";

export function SettingsPage() {
  return (
    <div className="flex flex-col gap-8 pb-10">
      <PageHeader title="Configurações" />
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-6">
        <div className="flex flex-col gap-2 pb-6">
          <h2 className="text-2xl font-semibold">
            Configurações da organização
          </h2>
          <p className="text-muted-foreground">
            Gerencie de forma centralizada as configurações da sua organização.
          </p>
        </div>
        <div className="w-full">
          <OrganizationSettingsForm />
        </div>
      </div>
    </div>
  );
}