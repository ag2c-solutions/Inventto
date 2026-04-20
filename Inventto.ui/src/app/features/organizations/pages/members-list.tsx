import { MembersListTable } from "../components/members-table";
import { PageHeader } from "@/app/components/shared/page-header";

export function MembersListPage() {

  return (
    <div className=" flex flex-col gap-4">
      <PageHeader title="Membros" />
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-6">
        <div className="flex flex-col gap-2 pb-6">
          <h2 className="text-2xl font-semibold">
            Gerenciar equipe
          </h2>
          <p className="text-muted-foreground">
            Gerencie de forma centralizada os membros da sua equipe.
          </p>
        </div>
        <MembersListTable />
      </div>
    </div>
  );
}