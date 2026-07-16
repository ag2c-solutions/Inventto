import { useIsMobile } from '@/shared/hooks/use-is-mobile';

import { MembersCardList } from '../components/members-list';
import { MembersListTable } from '../components/members-table';

export function MembersListPage() {
  const isMobile = useIsMobile();

  return (
    <div className=" flex flex-col gap-4">
      <div className="flex flex-col  px-1 py-2  md:px-6">
        <div className="flex flex-col gap-1.5 pb-6">
          <h2 className="text-2xl font-semibold">Gerenciar equipe</h2>
          <p className="text-muted-foreground">
            Gerencie de forma centralizada os membros da sua equipe.
          </p>
        </div>
        {isMobile ? <MembersCardList /> : <MembersListTable />}
      </div>
    </div>
  );
}
