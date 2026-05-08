import type { ComponentProps } from 'react';

import { Badge } from '@/shared/components/ui/badge';
import { cn } from '@/shared/utils';

import { useWizard } from '../../hooks';
import type { WizardStep } from '../../types';

export function WizardHeader({ className, ...props }: ComponentProps<'div'>) {
  const { state } = useWizard();

  return (
    <div
      className={cn('flex items-center', className)}
      role="list"
      aria-label="Progresso do assistente"
      {...props}
    >
      {state.steps.map((step: WizardStep, index: number) => {
        const isActive = index === state.currentStepIndex;
        const isCompleted = index < state.currentStepIndex;
        const isLast = index === state.totalSteps - 1;

        return (
          <div key={step.id} className="flex items-center" role="listitem">
            <Badge
              variant="outline"
              className={cn(
                'px-1.5 pr-2 py-1.5 gap-1.5 text-sm font-medium transition-all duration-300',
                isActive && 'bg-foreground text-background border-transparent',
                isCompleted &&
                  'bg-muted text-muted-foreground border-primary/30',
                !isActive &&
                  !isCompleted &&
                  'bg-zinc-100 text-muted-foreground/50 border-muted-foreground/30'
              )}
            >
              <div
                className={cn(
                  'flex size-4.5 shrink-0 items-center justify-center rounded-full text-xs font-semibold -mt-0.5',
                  isActive && 'bg-background text-foreground',
                  isCompleted && 'bg-primary text-primary-foreground',
                  !isActive &&
                    !isCompleted &&
                    'border border-muted-foreground/30 text-muted-foreground/50'
                )}
              >
                <span className="text-xs -mt-0.5">{index + 1}</span>
              </div>

              <span
                className={cn(
                  'text-xs -mt-0.5',
                  isActive && 'text-background',
                  isCompleted && 'text-primary'
                )}
              >
                {step.label}
              </span>
            </Badge>

            {!isLast && (
              <div
                className={cn(
                  'mx-1 h-px w-8 shrink-0 transition-colors duration-300',
                  isCompleted ? 'bg-primary' : 'bg-muted-foreground/20'
                )}
                aria-hidden="true"
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
