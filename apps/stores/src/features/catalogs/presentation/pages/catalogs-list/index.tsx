import { useIsMobile } from '@/shared/hooks/use-is-mobile';

import { CreateCatalogDialog } from '../../components/actions/create';
import { CatalogsTable } from '../../components/catalogs-table';
import { useCatalogsQuery } from '../../hooks/use-queries';

export function CatalogsListPage() {
  const { data, isLoading } = useCatalogsQuery();
  const isMobile = useIsMobile();

  return (
    <div className="flex flex-col flex-1 gap-4">
      <div className="flex flex-col gap-1.5 px-1 md:px-6 py-2">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">Catálogos</h1>
          {isMobile && <CreateCatalogDialog iconOnly />}
        </div>
        <p className="text-sm text-muted-foreground">
          Defina o que você vende e por quanto. Cada canal — PDV ou vitrine —
          escolhe qual catálogo usar.
        </p>
      </div>
      <div className="px-1 md:px-6 pb-6 flex-1 flex flex-col">
        <CatalogsTable data={data || []} isLoading={isLoading} />
      </div>
    </div>
  );
}
