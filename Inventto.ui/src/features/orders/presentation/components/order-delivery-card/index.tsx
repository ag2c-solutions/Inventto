import { Lock, MapPin } from 'lucide-react';

import type { Order } from '../../../domain/entities';

interface OrderDeliveryCardProps {
  order: Order;
}

// RN083/RN084: endereço estruturado, capturado no checkout — snapshot
// imutável, não referencia o cadastro atual do cliente.
export function OrderDeliveryCard({ order }: OrderDeliveryCardProps) {
  const address = order.address;

  const line1 = address
    ? [address.street, address.number].filter(Boolean).join(', ')
    : undefined;
  const line2 = address
    ? [
        address.neighborhood,
        address.city && address.state
          ? `${address.city} · ${address.state}`
          : address.city
      ]
        .filter(Boolean)
        .join(' · ')
    : undefined;

  return (
    <div className="rounded-lg border">
      <div className="flex items-center gap-2 border-b bg-muted/30 px-3 py-2">
        <MapPin className="size-3.5 text-muted-foreground" />
        <span className="text-xs font-semibold text-muted-foreground">
          Endereço de entrega
        </span>
      </div>

      <div className="flex flex-col gap-2 p-3">
        {address ? (
          <div className="text-sm text-foreground">
            <p className="font-medium">{line1}</p>
            {line2 && <p className="text-muted-foreground">{line2}</p>}
            {address.zipCode && (
              <p className="text-muted-foreground">CEP {address.zipCode}</p>
            )}
            {address.complement && (
              <p className="text-muted-foreground">{address.complement}</p>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Endereço não informado.
          </p>
        )}

        <span className="inline-flex w-fit items-center gap-1.5 rounded-md bg-muted px-2 py-1 text-[11px] font-medium text-muted-foreground">
          <Lock className="size-3" />
          Snapshot no momento do pedido · RN083
        </span>
      </div>
    </div>
  );
}
