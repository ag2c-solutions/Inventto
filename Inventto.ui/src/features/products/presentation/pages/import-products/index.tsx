import { useMemo, useState } from 'react';
import { Boxes, Download, Loader2, Package, Search } from 'lucide-react';

import { useUser } from '@/features/users';

import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Skeleton } from '@/shared/components/ui/skeleton';

import { BackToProductsLink } from '../../components/actions/back-to-products';
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
  const [searchQuery, setSearchQuery] = useState('');

  const { data: candidates, isFetching } =
    useImportCandidatesQuery(sourceOrgId);

  const importMutation = useImportProductsMutation();
  const isImporting = importMutation.isPending;

  const filteredCandidates = useMemo(() => {
    if (!candidates) return [];
    const q = searchQuery.trim().toLowerCase();
    if (!q) return candidates;
    return candidates.filter((c) => c.name.toLowerCase().includes(q));
  }, [candidates, searchQuery]);

  const selectableCandidates = useMemo(
    () => filteredCandidates.filter((c) => !c.alreadyImported),
    [filteredCandidates]
  );

  const allSelectableSelected =
    selectableCandidates.length > 0 &&
    selectableCandidates.every((c) => selectedIds.has(c.id));

  const handleSourceChange = (value: string) => {
    setSourceOrgId(value);
    setSelectedIds(new Set());
    setSearchQuery('');
  };

  const toggleSelection = (id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) {
        selectableCandidates.forEach((c) => next.add(c.id));
      } else {
        selectableCandidates.forEach((c) => next.delete(c.id));
      }
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
      <BackToProductsLink />
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
  const selectableCount = selectableCandidates.length;

  const showNoResults =
    hasCandidates &&
    filteredCandidates.length === 0 &&
    searchQuery.trim() !== '';

  return (
    <div className="flex flex-col gap-6">
      {header}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-3">
        <ImportSourceSelect
          value={sourceOrgId}
          options={sourceOptions}
          onChange={handleSourceChange}
        />

        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="import-search"
            placeholder="Pesquisar por nome…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            disabled={!sourceOrgId}
            className="pl-9"
            aria-label="Pesquisar produtos pelo nome"
          />
        </div>

        <Button
          id="import-select-all"
          type="button"
          variant="outline"
          size="sm"
          onClick={() => handleSelectAll(!allSelectableSelected)}
          disabled={!sourceOrgId || selectableCount === 0 || isImporting}
          className="shrink-0 gap-1.5"
        >
          {allSelectableSelected ? 'Desmarcar todos' : 'Selecionar todos'}
        </Button>
      </div>

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
      ) : showNoResults ? (
        <ImportEmptyState
          icon={Search}
          title={`Nenhum produto encontrado para "${searchQuery}".`}
          description="Tente um nome diferente ou limpe a pesquisa."
        />
      ) : (
        <>
          <div className="divide-y divide-border overflow-hidden rounded-xl border border-border">
            {filteredCandidates.map((candidate) => (
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
