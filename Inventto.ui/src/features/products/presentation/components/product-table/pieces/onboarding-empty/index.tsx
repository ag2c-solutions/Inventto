import { Link } from 'react-router';
import { Download, Package, PlusCircle } from 'lucide-react';

import { ActionButton } from '@/features/permissions';
import { useUser } from '@/features/users';

export function ProductListOnboardingEmpty() {
  const { currentOrganization, availableOrganizations } = useUser();

  const canImport =
    (availableOrganizations ?? []).filter(
      (org) => org.id !== currentOrganization?.id
    ).length > 0;

  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed px-6 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-sidebar/70">
        <Package className="h-7 w-7 text-muted-foreground/70" />
      </div>

      <h3 className="text-lg font-semibold">
        Comece cadastrando seu primeiro produto.
      </h3>

      <p className="max-w-md text-sm text-muted-foreground">
        {canImport
          ? 'Produtos aparecem aqui com saldo, status e categorias. Cadastre o primeiro ou importe de outra unidade do seu negócio.'
          : 'Produtos aparecem aqui com saldo, status e categorias. Cadastre o primeiro para começar.'}
      </p>

      <div className="mt-2 flex flex-col items-center gap-3 sm:flex-row">
        {canImport && (
          <ActionButton
            action="product:create"
            size="sm"
            variant="outline"
            className="cursor-pointer"
            asChild
          >
            <Link className="flex items-center gap-2" to="/products/import">
              <Download className="h-4 w-4" />
              Importar produtos
            </Link>
          </ActionButton>
        )}

        <ActionButton
          action="product:create"
          size="sm"
          className="bg-green-950 cursor-pointer"
          asChild
        >
          <Link className="flex items-center gap-2" to="/products/create">
            <PlusCircle className="h-4 w-4" />
            Cadastrar produto
          </Link>
        </ActionButton>
      </div>
    </div>
  );
}
