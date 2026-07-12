import {
  Ban,
  CheckCircle2,
  Clock,
  Info,
  type LucideIcon,
  Package,
  Truck
} from 'lucide-react';

import { Badge } from '@/shared/components/ui/badge';

import type { OrderMicroState } from '../../../domain/entities';

interface MicroStateMeta {
  label: string;
  icon: LucideIcon;
  className: string;
}

// Tom por etapa (DS §1.2): pendente/confirmando = alerta; separação/entrega
// = destaque (ardósia); finalizado = sucesso; cancelado = inativo sólido;
// expirado = inativo contorno (distingue expiração de cancelamento manual).
const MICRO_STATE_META: Record<OrderMicroState, MicroStateMeta> = {
  pending: {
    label: 'Pendente',
    icon: Clock,
    className: 'border-amber-300 bg-amber-100 text-amber-800'
  },
  confirming: {
    label: 'Confirmando',
    icon: Info,
    className: 'border-amber-300 bg-amber-100 text-amber-800'
  },
  picking: {
    label: 'Em separação',
    icon: Package,
    className: 'border-slate-300 bg-slate-100 text-slate-700'
  },
  delivering: {
    label: 'Em entrega',
    icon: Truck,
    className: 'border-slate-300 bg-slate-100 text-slate-700'
  },
  confirmed: {
    label: 'Finalizado',
    icon: CheckCircle2,
    className: 'border-green-200 bg-green-100 text-green-800'
  },
  cancelled: {
    label: 'Cancelado',
    icon: Ban,
    className: 'border-foreground bg-foreground text-background'
  },
  expired: {
    label: 'Expirado',
    icon: Clock,
    className: 'border-muted-foreground/40 bg-transparent text-muted-foreground'
  }
};

interface OrderCardBadgeProps {
  microState: OrderMicroState;
}

export function OrderCardBadge({ microState }: OrderCardBadgeProps) {
  const meta = MICRO_STATE_META[microState];
  const Icon = meta.icon;

  return (
    <Badge className={`gap-1 font-medium ${meta.className}`}>
      <Icon className="size-3" />
      {meta.label}
    </Badge>
  );
}
