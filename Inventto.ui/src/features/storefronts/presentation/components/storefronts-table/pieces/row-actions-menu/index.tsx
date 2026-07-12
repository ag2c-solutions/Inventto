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
import { PublishDialog } from '../../../publish-dialog';
import { RemoveStorefrontDialog } from '../../../remove-storefront-dialog';

import { useRowActionsMenu } from './hooks/use-row-actions-menu';

interface RowActionsMenuProps {
  storefront: Storefront;
}

export function RowActionsMenu({ storefront }: RowActionsMenuProps) {
  const {
    isPublishDialogOpen,
    setIsPublishDialogOpen,
    isRemoveDialogOpen,
    setIsRemoveDialogOpen,
    handleUnpublish,
    handlePublish,
    handleCopyLink
  } = useRowActionsMenu(storefront);

  return (
    <>
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
              <DropdownMenuItem onClick={handleUnpublish}>
                <MegaphoneOff className="h-4 w-4" />
                Despublicar
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={!storefront.publicUrl}
                onClick={handleCopyLink}
              >
                <Copy className="h-4 w-4" />
                Copiar link
              </DropdownMenuItem>
            </>
          ) : (
            <DropdownMenuItem onClick={handlePublish}>
              <Megaphone className="h-4 w-4" />
              Publicar
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          <DropdownMenuItem
            variant="destructive"
            onClick={() => setIsRemoveDialogOpen(true)}
          >
            <Trash2 className="h-4 w-4" />
            Remover vitrine
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <PublishDialog
        storefront={storefront}
        open={isPublishDialogOpen}
        onOpenChange={setIsPublishDialogOpen}
      />

      <RemoveStorefrontDialog
        storefront={storefront}
        open={isRemoveDialogOpen}
        onOpenChange={setIsRemoveDialogOpen}
      />
    </>
  );
}
