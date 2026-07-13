import { Link } from 'react-router';
import { ChevronRight, type LucideIcon, TriangleAlert } from 'lucide-react';

import { Badge } from '@/shared/components/ui/badge';
import { cn } from '@/shared/utils';

type AttentionCardAccent = 'warning' | 'critical';

const ACCENT_CLASSNAMES: Record<
  AttentionCardAccent,
  { border: string; icon: string; badge: string }
> = {
  warning: {
    border: 'border-[var(--status-warning)]/40',
    icon: 'bg-[var(--status-warning-soft)] text-[var(--status-warning)] border-[var(--status-warning)]/30',
    badge:
      'bg-[var(--status-warning-soft)] text-[var(--status-warning)] border-[var(--status-warning)]/30'
  },
  critical: {
    border: 'border-[var(--status-critical)]/40',
    icon: 'bg-[var(--status-critical-soft)] text-[var(--status-critical)] border-[var(--status-critical)]/30',
    badge:
      'bg-[var(--status-critical-soft)] text-[var(--status-critical)] border-[var(--status-critical)]/30'
  }
};

interface AttentionCardProps {
  icon: LucideIcon;
  value: number;
  label: string;
  href: string;
  accent: AttentionCardAccent;
  badge?: string;
}

export function AttentionCard({
  icon: Icon,
  value,
  label,
  href,
  accent,
  badge
}: AttentionCardProps) {
  const isZero = value === 0;
  const accentClasses = ACCENT_CLASSNAMES[accent];

  return (
    <Link
      to={href}
      className={cn(
        'flex flex-col gap-2 rounded-lg border p-4 transition-colors hover:bg-accent/50',
        !isZero && accentClasses.border
      )}
    >
      <div className="flex items-center gap-2">
        <span
          className={cn(
            'flex size-8 shrink-0 items-center justify-center rounded-md border',
            isZero
              ? 'border-transparent text-muted-foreground'
              : accentClasses.icon
          )}
        >
          <Icon className="size-4" />
        </span>
        <ChevronRight className="ml-auto size-4 text-muted-foreground" />
      </div>

      {badge && !isZero && (
        <Badge className={cn('w-fit gap-1', accentClasses.badge)}>
          <TriangleAlert className="size-3" />
          {badge}
        </Badge>
      )}

      <span
        className={cn(
          'text-3xl font-bold',
          isZero ? 'text-muted-foreground' : 'text-foreground'
        )}
      >
        {value}
      </span>
      <span className="text-sm text-muted-foreground">{label}</span>
    </Link>
  );
}
