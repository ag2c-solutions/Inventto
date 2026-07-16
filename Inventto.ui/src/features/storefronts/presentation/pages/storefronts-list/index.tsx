import { StorefrontsTable } from '../../components/storefronts-table';
import { useStorefrontsQuery } from '../../hooks/use-queries';

export function StorefrontsListPage() {
  const { data, isLoading } = useStorefrontsQuery();

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex flex-col gap-1.5 px-1 py-2 md:px-6">
        <h1 className="text-2xl font-semibold tracking-tight">Vitrines</h1>
        <p className="text-sm text-muted-foreground">
          Suas lojas online. Cada vitrine aponta para um catálogo e vende pelo
          link.
        </p>
      </div>
      <div className="flex flex-1 flex-col px-1 pb-6 md:px-6">
        <StorefrontsTable data={data || []} isLoading={isLoading} />
      </div>
    </div>
  );
}
