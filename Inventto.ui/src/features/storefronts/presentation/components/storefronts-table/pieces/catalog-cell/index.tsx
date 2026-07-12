import { Layers } from 'lucide-react';

interface CatalogCellProps {
  catalogName?: string;
}

export function CatalogCell({ catalogName }: CatalogCellProps) {
  if (!catalogName) {
    return <span className="text-sm text-muted-foreground">Nenhum</span>;
  }

  return (
    <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
      <Layers className="h-3.5 w-3.5" />
      {catalogName}
    </span>
  );
}
