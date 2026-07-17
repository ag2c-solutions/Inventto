import { Fragment } from 'react';
import { MessageCircle, MoreVertical } from 'lucide-react';

import { Button } from '@/shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/shared/components/ui/dropdown-menu';

import type {
  OrderCardChatAction,
  OrderCardMenuAction
} from '../../hooks/use-order-card-actions';

interface OrderCardFooterProps {
  chatAction: OrderCardChatAction;
  menuActions: OrderCardMenuAction[];
  isMenuDisabled: boolean;
  isPending: boolean;
}

const CHAT_BUTTON_VARIANT = {
  primary: 'default',
  ghost: 'outline',
  disabled: 'ghost'
} as const;

// Rodapé de 2 zonas (RF034): Chat (muda por macro-estado) + DropdownMenu
// (só ativo em "Em atendimento" — encerrados mantêm a área, desabilitada).
export function OrderCardFooter({
  chatAction,
  menuActions,
  isMenuDisabled,
  isPending
}: OrderCardFooterProps) {
  return (
    <div
      className="flex items-center gap-2 border-t bg-muted/30 p-2"
      onClick={(event) => event.stopPropagation()}
    >
      <Button
        type="button"
        size="sm"
        variant={CHAT_BUTTON_VARIANT[chatAction.variant]}
        disabled={chatAction.variant === 'disabled' || isPending}
        onClick={chatAction.onClick}
        className="h-8 flex-1 gap-1.5 text-xs"
      >
        <MessageCircle className="size-3.5" />
        {chatAction.label}
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            size="icon-sm"
            variant="outline"
            disabled={isMenuDisabled || isPending}
            aria-label="Ações do pedido"
            className="h-8 w-8"
          >
            <MoreVertical className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {menuActions.map((action, index) => (
            <Fragment key={action.label}>
              {action.danger && index > 0 && <DropdownMenuSeparator />}
              <DropdownMenuItem
                variant={action.danger ? 'destructive' : 'default'}
                onClick={action.onClick}
              >
                <action.icon className="size-4" />
                {action.label}
              </DropdownMenuItem>
            </Fragment>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
