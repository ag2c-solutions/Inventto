import { Link } from 'react-router';
import {
  Copy,
  EllipsisVertical,
  Megaphone,
  MegaphoneOff,
  Settings,
  Trash2
} from 'lucide-react';

import { Button } from '@/shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/shared/components/ui/dropdown-menu';

import type { Storefront } from '../../../../../domain/entities';
import { useUnpublishStorefrontMutation } from '../../../../hooks/use-mutations';

import { useCopyStorefrontLink } from './hooks/use-copy-storefront-link';

interface RowActionsMenuProps {
  storefront: Storefront;
}

export function RowActionsMenu({ storefront }: RowActionsMenuProps) {
  const { mutate: unpublish } = useUnpublishStorefrontMutation();
  const { copyLink } = useCopyStorefrontLink();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Ações da vitrine"
          className="text-sidebar-foreground"
        >
          <EllipsisVertical className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link to={`/storefronts/${storefront.id}`}>
            <Settings className="h-4 w-4" />
            Configurar
          </Link>
        </DropdownMenuItem>

        {storefront.state === 'live' ? (
          <>
            <DropdownMenuItem onClick={() => unpublish(storefront.id)}>
              <MegaphoneOff className="h-4 w-4" />
              Despublicar
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={!storefront.publicUrl}
              onClick={() =>
                storefront.publicUrl && copyLink(storefront.publicUrl)
              }
            >
              <Copy className="h-4 w-4" />
              Copiar link
            </DropdownMenuItem>
          </>
        ) : (
          // Publicar com pré-requisitos (RN075) é implementado em VIT-02.
          <DropdownMenuItem disabled>
            <Megaphone className="h-4 w-4" />
            Publicar
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        {/* Remoção (com guard equivalente a RN061) é implementada em VIT-02. */}
        <DropdownMenuItem variant="destructive" disabled>
          <Trash2 className="h-4 w-4" />
          Remover vitrine
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
