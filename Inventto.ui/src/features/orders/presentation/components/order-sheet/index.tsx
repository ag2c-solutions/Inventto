import { ChevronLeft, Loader2, SearchX } from 'lucide-react';

import { Button } from '@/shared/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle
} from '@/shared/components/ui/sheet';

import type { Order } from '../../../domain/entities';
import { useOrderQuery } from '../../hooks/use-queries';
import { useOrderSheetStore } from '../../stores/order-sheet-store';
import { OrderCardBadge } from '../order-card-badge';
import { OrderCustomerCard } from '../order-customer-card';
import { OrderDeliveryCard } from '../order-delivery-card';
import { OrderItemsCard } from '../order-items-card';
import { OrderMetaCard } from '../order-meta-card';
import { OrderSheetFooter } from '../order-sheet-footer';
import { OrderTimer } from '../order-timer';

import { useOrderSheetActions } from './hooks/use-order-sheet-actions';

interface OrderSheetProps {
  onCancelRequest: (order: Order) => void;
}

// PED-04: Sheet de atendimento (/pedidos/:id) — lateral sobre o Kanban.
// Aberta/fechada pelo useOrderSheetStore (mesmo padrão do MovementSheet);
// busca o pedido pelo id guardado no store, não recebe o objeto pronto.
export function OrderSheet({ onCancelRequest }: OrderSheetProps) {
  const orderId = useOrderSheetStore((state) => state.orderId);
  const close = useOrderSheetStore((state) => state.close);

  const { data: order, isLoading } = useOrderQuery(orderId ?? undefined);

  return (
    <Sheet open={!!orderId} onOpenChange={(open) => !open && close()}>
      <SheetContent className="flex w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-[420px]">
        <SheetTitle className="sr-only">Atendimento do pedido</SheetTitle>
        <SheetDescription className="sr-only">
          Dados do pedido e ações da esteira de atendimento.
        </SheetDescription>

        {isLoading ? (
          <div className="flex flex-1 items-center justify-center">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : !order ? (
          <OrderSheetNotFound onBack={close} />
        ) : (
          <OrderSheetContent
            order={order}
            onCancelRequest={onCancelRequest}
            onClose={close}
          />
        )}
      </SheetContent>
    </Sheet>
  );
}

function OrderSheetNotFound({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
      <div className="flex size-14 items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/30 bg-muted/30 text-muted-foreground">
        <SearchX className="size-6" />
      </div>
      <div className="space-y-1.5">
        <p className="text-base font-bold">Pedido não encontrado</p>
        <p className="text-sm text-muted-foreground">
          Este pedido não existe, foi removido ou você não tem permissão para
          vê-lo.
        </p>
      </div>
      <Button
        type="button"
        variant="outline"
        onClick={onBack}
        className="gap-2"
      >
        <ChevronLeft className="size-4" />
        Voltar para a lista de pedidos
      </Button>
    </div>
  );
}

interface OrderSheetContentProps {
  order: Order;
  onCancelRequest: (order: Order) => void;
  onClose: () => void;
}

function OrderSheetContent({
  order,
  onCancelRequest,
  onClose
}: OrderSheetContentProps) {
  const { primaryAction, onCancel, isSaving, savingLabel } =
    useOrderSheetActions({ order, onCancelRequest, onFinalized: onClose });

  const isPool = order.macroState === 'pool';

  return (
    <>
      <div className="flex flex-col gap-2 border-b p-4">
        <button
          type="button"
          onClick={onClose}
          className="inline-flex w-fit items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="size-3.5" />
          Pedidos
        </button>
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-sm font-bold text-foreground">
            #{order.code}
          </span>
          <OrderCardBadge microState={order.microState} />
          {isPool && order.expiresAt && (
            <OrderTimer expiresAt={order.expiresAt} />
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
        <OrderCustomerCard order={order} />
        <OrderItemsCard order={order} />
        <OrderDeliveryCard order={order} />
        <OrderMetaCard order={order} />
      </div>

      <OrderSheetFooter
        primaryAction={primaryAction}
        onCancel={onCancel}
        isSaving={isSaving}
        savingLabel={savingLabel}
      />
    </>
  );
}
