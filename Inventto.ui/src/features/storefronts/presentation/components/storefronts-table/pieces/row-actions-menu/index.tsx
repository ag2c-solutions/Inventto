import { useState } from 'react';
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from '@/shared/components/ui/sheet';
import { useIsMobile } from '@/shared/hooks/use-is-mobile';
import { cn } from '@/shared/utils';

import type { Storefront } from '../../../../../domain/entities';
import { PublishDialog } from '../../../publish-dialog';
import { RemoveStorefrontDialog } from '../../../remove-storefront-dialog';

import { useRowActionsMenu } from './hooks/use-row-actions-menu';

interface RowActionsMenuProps {
  storefront: Storefront;
}

const ACTION_ROW_CLASS =
  'flex w-full items-center gap-2.5 rounded-md px-3 py-2.5 text-sm hover:bg-accent disabled:pointer-events-none disabled:opacity-50';

export function RowActionsMenu({ storefront }: RowActionsMenuProps) {
  const isMobile = useIsMobile();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const {
    isPublishDialogOpen,
    setIsPublishDialogOpen,
    isRemoveDialogOpen,
    setIsRemoveDialogOpen,
    handleUnpublish,
    handlePublish,
    handleCopyLink
  } = useRowActionsMenu(storefront);

  const trigger = (
    <Button
      variant="ghost"
      size="icon-sm"
      aria-label="Ações da vitrine"
      className="text-sidebar-foreground"
    >
      <EllipsisVertical className="h-5 w-5" />
    </Button>
  );

  function runAndClose(action: () => void) {
    setIsSheetOpen(false);
    action();
  }

  return (
    <>
      {isMobile ? (
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>{trigger}</SheetTrigger>
          <SheetContent side="bottom" className="rounded-t-lg">
            <SheetHeader>
              <SheetTitle>
                {storefront.name} ·{' '}
                {storefront.state === 'live' ? 'No ar' : 'Inativa'}
              </SheetTitle>
            </SheetHeader>

            <div className="flex flex-col gap-1 px-4 pb-4">
              <Link
                to={`/storefronts/${storefront.id}`}
                onClick={() => setIsSheetOpen(false)}
                className={ACTION_ROW_CLASS}
              >
                <Settings className="h-4 w-4" />
                Configurar
              </Link>

              {storefront.state === 'live' ? (
                <>
                  <button
                    type="button"
                    onClick={() => runAndClose(handleUnpublish)}
                    className={ACTION_ROW_CLASS}
                  >
                    <MegaphoneOff className="h-4 w-4" />
                    Despublicar
                  </button>
                  <button
                    type="button"
                    disabled={!storefront.publicUrl}
                    onClick={() => runAndClose(handleCopyLink)}
                    className={ACTION_ROW_CLASS}
                  >
                    <Copy className="h-4 w-4" />
                    Copiar link
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => runAndClose(handlePublish)}
                  className={ACTION_ROW_CLASS}
                >
                  <Megaphone className="h-4 w-4" />
                  Publicar
                </button>
              )}

              <button
                type="button"
                onClick={() => runAndClose(() => setIsRemoveDialogOpen(true))}
                className={cn(ACTION_ROW_CLASS, 'text-destructive')}
              >
                <Trash2 className="h-4 w-4" />
                Remover vitrine
              </button>
            </div>
          </SheetContent>
        </Sheet>
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>

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
      )}

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
