import { useMemo, useState } from 'react';
import { Boxes, Download, Loader2, Package } from 'lucide-react';

import { useUser } from '@/features/users';

import { Button } from '@/shared/components/ui/button';
import { Skeleton } from '@/shared/components/ui/skeleton';

import { ImportCandidateRow } from '../../components/import-products/import-candidate-row';
import { ImportEmptyState } from '../../components/import-products/import-empty-state';
import { ImportSourceSelect } from '../../components/import-products/import-source-select';
import { useImportProductsMutation } from '../../hooks/use-mutations';
import { useImportCandidatesQuery } from '../../hooks/use-queries';

export const ImportProductsPage = () => {
  const { currentOrganization, availableOrganizations } = useUser();

  const sourceOptions = useMemo(
    () =>
      availableOrganizations.filter(
        (org) => org.id !== currentOrganization?.id
      ),
    [availableOrganizations, currentOrganization?.id]
  );

  const [sourceOrgId, setSourceOrgId] = useState<string | undefined>(undefined);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const { data: candidates, isFetching } =
    useImportCandidatesQuery(sourceOrgId);

  const importMutation = useImportProductsMutation();
  const isImporting = importMutation.isPending;

  const handleSourceChange = (value: string) => {
    setSourceOrgId(value);
    setSelectedIds(new Set());
  };

  const toggleSelection = (id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const handleImport = () => {
    if (!sourceOrgId || selectedIds.size === 0) return;

    importMutation.mutate(
      {
        sourceOrganizationId: sourceOrgId,
        productIds: Array.from(selectedIds)
      },
      { onSuccess: () => setSelectedIds(new Set()) }
    );
  };

  const header = (
    <div className="flex flex-col gap-2">
      <h1 className="text-2xl font-semibold">Importar produtos</h1>
      <p className="text-muted-foreground">
        Copie produtos de outra unidade do seu negócio.
      </p>
    </div>
  );

  if (sourceOptions.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        {header}
        <ImportEmptyState
          icon={Boxes}
          title="Você precisa de mais de uma organização para importar produtos."
          description="A importação copia configurações de produtos entre unidades do mesmo negócio."
        />
      </div>
    );
  }

  const hasCandidates = !!candidates && candidates.length > 0;
  const selectableCount = (candidates ?? []).filter(
    (candidate) => !candidate.alreadyImported
  ).length;

  return (
    <div className="flex flex-col gap-6">
      {header}

      <ImportSourceSelect
        value={sourceOrgId}
        options={sourceOptions}
        onChange={handleSourceChange}
      />

      {!sourceOrgId ? null : isFetching && !candidates ? (
        <div className="flex flex-col gap-2 rounded-xl border border-border p-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-16 w-full rounded-md" />
          ))}
        </div>
      ) : !hasCandidates ? (
        <ImportEmptyState
          icon={Package}
          title="Nenhum produto disponível para importar nesta organização."
          description="Selecione outra unidade de origem ou cadastre produtos lá primeiro."
        />
      ) : (
        <>
          <div className="divide-y divide-border overflow-hidden rounded-xl border border-border">
            {candidates.map((candidate) => (
              <ImportCandidateRow
                key={candidate.id}
                candidate={candidate}
                checked={selectedIds.has(candidate.id)}
                disabled={candidate.alreadyImported || isImporting}
                sourceOrganizationId={sourceOrgId}
                onCheckedChange={(checked) =>
                  toggleSelection(candidate.id, checked)
                }
              />
            ))}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-sm text-muted-foreground">
              <b className="font-semibold text-foreground">
                {selectedIds.size}
              </b>{' '}
              produto(s) selecionado(s)
            </span>

            <Button
              className="bg-green-950"
              disabled={
                selectedIds.size === 0 || isImporting || selectableCount === 0
              }
              onClick={handleImport}
            >
              {isImporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              {isImporting ? 'Importando…' : 'Importar selecionados'}
            </Button>
          </div>

          {!isImporting && (
            <p className="text-sm text-muted-foreground">
              Os produtos importados nascem com estoque zero. Estoque, preço e
              histórico nunca são copiados.
            </p>
          )}
        </>
      )}
    </div>
  );
};
