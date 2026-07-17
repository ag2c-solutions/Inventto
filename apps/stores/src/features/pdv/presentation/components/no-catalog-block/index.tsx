import { useState } from 'react';
import { Layers } from 'lucide-react';

import { Button } from '@/shared/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/shared/components/ui/select';

import { useCatalogsQuery } from '@/features/catalogs';
import { usePermission } from '@/features/permissions';

import { useSetPdvCatalogMutation } from '../../hooks/use-set-pdv-catalog';

export function NoCatalogBlock() {
  const { can } = usePermission();
  // RN065/RN067: vincular catálogo ao PDV é config. de organização, mas
  // usa o recorte de catalog:manage (Manager/Owner) em vez de org:manage —
  // org:manage hoje é Owner-only e gate mais amplo (Equipe/Organização);
  // usá-lo aqui sobre-concederia acesso a essas telas para Manager.
  const canManage = can('catalog:manage');
  const { data: catalogs = [] } = useCatalogsQuery();
  const { mutate, isPending } = useSetPdvCatalogMutation();
  const [selectedCatalogId, setSelectedCatalogId] = useState('');

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-sidebar/70">
        <Layers className="h-7 w-7 text-muted-foreground/70" />
      </div>

      <h2 className="text-lg font-semibold">
        Vincule um catálogo ao PDV para começar a vender.
      </h2>

      <p className="max-w-md text-sm text-muted-foreground">
        O balcão usa um catálogo de PDV para saber o que está à venda e por
        quanto. Escolha ou crie um catálogo com ao menos um produto.
      </p>

      {canManage ? (
        catalogs.length > 0 ? (
          <div className="flex flex-col items-center gap-2 sm:flex-row">
            <Select
              value={selectedCatalogId}
              onValueChange={setSelectedCatalogId}
            >
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="Selecione um catálogo" />
              </SelectTrigger>
              <SelectContent>
                {catalogs.map((catalog) => (
                  <SelectItem key={catalog.id} value={catalog.id}>
                    {catalog.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              type="button"
              disabled={!selectedCatalogId || isPending}
              onClick={() => mutate(selectedCatalogId)}
            >
              {isPending ? 'Vinculando...' : 'Escolher catálogo'}
            </Button>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Nenhum catálogo disponível — crie um catálogo primeiro.
          </p>
        )
      ) : (
        <p className="text-xs text-muted-foreground">
          Peça a um gestor para vincular um catálogo ao PDV.
        </p>
      )}
    </div>
  );
}
