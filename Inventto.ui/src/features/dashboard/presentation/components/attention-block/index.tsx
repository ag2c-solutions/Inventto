import { ClipboardList, Clock, type LucideIcon, PackageX } from 'lucide-react';

import { cn } from '@/shared/utils';

import type { Role } from '@/features/permissions';

import type { AttentionSummary } from '../../../domain/entities';
import { useAttentionSummaryQuery } from '../../hooks/use-queries';
import { AttentionCard } from '../attention-card';
import { BlockBoundary } from '../block-boundary';

import { AttentionBlockSkeleton } from './pieces/skeleton';

interface AttentionCardSpec {
  key: string;
  icon: LucideIcon;
  label: string;
  href: string;
  accent: 'warning' | 'critical';
  badge?: string;
  value: number;
}

// RN091: recorte por papel na composição — Sales só vê "perto de expirar".
// Reforçado no servidor: get_attention_summary já omite pendingOrders/
// lowStock para Sales, daí o `!== undefined` como segunda barreira.
function buildCards(
  summary: AttentionSummary,
  role: Role
): AttentionCardSpec[] {
  const cards: AttentionCardSpec[] = [];

  if (role !== 'sales' && summary.pendingOrders !== undefined) {
    cards.push({
      key: 'pending-orders',
      icon: ClipboardList,
      label: 'Pedidos pendentes',
      href: '/pedidos',
      accent: 'warning',
      value: summary.pendingOrders
    });
  }

  if (role !== 'sales' && summary.lowStock !== undefined) {
    cards.push({
      key: 'low-stock',
      icon: PackageX,
      label: 'Estoque crítico ou zerado',
      href: '/products',
      accent: 'critical',
      value: summary.lowStock
    });
  }

  cards.push({
    key: 'expiring-soon',
    icon: Clock,
    label:
      role === 'sales'
        ? 'Pedidos do pool perto de expirar'
        : 'Expirando em breve',
    href: '/pedidos',
    accent: 'warning',
    badge: role === 'sales' ? 'Urgente' : '< 30 min',
    value: summary.expiringSoon
  });

  return cards;
}

interface AttentionBlockProps {
  role: Role;
}

export function AttentionBlock({ role }: AttentionBlockProps) {
  const { data, isLoading, isError, refetch } = useAttentionSummaryQuery();

  const cards = data ? buildCards(data, role) : [];

  return (
    <>
      <h2 className="text-[13px] font-bold tracking-wide uppercase">
        Atenção imediata
      </h2>
      <BlockBoundary
        isLoading={isLoading}
        isError={isError}
        onRetry={refetch}
        skeleton={<AttentionBlockSkeleton count={role === 'sales' ? 1 : 3} />}
      >
        <div
          className={cn(
            'grid grid-cols-1 gap-3',
            cards.length > 1 && 'sm:grid-cols-3'
          )}
        >
          {cards.map(({ key, ...card }) => (
            <AttentionCard key={key} {...card} />
          ))}
        </div>
      </BlockBoundary>
    </>
  );
}
