import { Link } from 'react-router';
import { Check, ChevronRight, CircleCheck } from 'lucide-react';

import { cn } from '@/shared/utils';

import type { OnboardingStep } from '../../../domain/entities';

interface OnboardingStepCardProps {
  step: OnboardingStep;
  index: number;
}

export function OnboardingStepCard({ step, index }: OnboardingStepCardProps) {
  const { title, subtitle, href, done, active } = step;

  return (
    <div
      className={cn(
        'flex items-center gap-4 rounded-xl border p-4',
        done &&
          'border-[var(--status-healthy)]/40 bg-[var(--status-healthy-soft)]',
        active && 'border-foreground ring-[3px] ring-ring/10'
      )}
    >
      <span
        className={cn(
          'flex size-9 shrink-0 items-center justify-center rounded-full border font-bold',
          done &&
            'border-[var(--status-healthy)] bg-[var(--status-healthy)] text-border-foreground',
          active && 'border bg-border text-border-foreground',
          !done && !active && 'text-muted-foreground'
        )}
      >
        {done ? <Check className="size-4" /> : index + 1}
      </span>

      <div className="min-w-0 flex-1">
        <p
          className={cn(
            'text-sm text-border-foreground',
            done && 'text-[var(--status-healthy)]'
          )}
        >
          {title}
        </p>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>

      {done ? (
        <span className="flex shrink-0 items-center gap-1.5 text-[11.5px] font-semibold text-[var(--status-healthy)]">
          <CircleCheck className="size-3.5" />
          Concluído
        </span>
      ) : (
        <Link
          to={href}
          className="flex shrink-0 items-center gap-1.5 rounded-lg bg-border px-4 py-2 text-xs font-semibold text-border-foreground"
        >
          Começar
          <ChevronRight className="size-3.5" />
        </Link>
      )}
    </div>
  );
}
