import { type ComponentProps, Fragment } from 'react';
import { Check } from 'lucide-react';

import { Badge } from '@/shared/components/ui/badge';
import { Progress } from '@/shared/components/ui/progress';
import { useIsMobile } from '@/shared/hooks/use-is-mobile';
import { cn } from '@/shared/utils';

import { useWizard } from '../../hooks';
import type { WizardStep } from '../../types';

export function WizardHeader({ className, ...props }: ComponentProps<'div'>) {
  const { state } = useWizard();
  const isMobile = useIsMobile();

  if (isMobile) {
    const current = state.currentStepIndex + 1;

    return (
      <div className={cn('flex flex-col gap-2 w-full', className)} {...props}>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">
            {state.currentStep?.label}
          </span>
          <span className="text-xs text-muted-foreground">
            Passo {current} de {state.totalSteps}
          </span>
        </div>
        <Progress value={(current / state.totalSteps) * 100} />
      </div>
    );
  }

  return (
    <div
      className={cn('flex items-center justify-between w-full', className)}
      role="list"
      aria-label="Progresso do assistente"
      {...props}
    >
      {state.steps.map((step: WizardStep, index: number) => {
        const isActive = index === state.currentStepIndex;
        const isCompleted = index < state.currentStepIndex;
        const isLast = index === state.totalSteps - 1;

        return (
          <Fragment key={step.id}>
            <div role="listitem" className="shrink-0">
              <Badge
                variant="outline"
                className={cn(
                  'px-1.5 pr-2 py-1.5 gap-1.5 text-sm font-medium transition-all duration-300',
                  isActive &&
                    'bg-foreground text-background border-transparent',
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
                  {isCompleted ? (
                    <Check className="size-2.5 text-success" />
                  ) : (
                    <span className="text-xs -mt-0.5">{index + 1}</span>
                  )}
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
            </div>

            {!isLast && (
              <div
                className={cn(
                  'mx-2 h-px flex-1 transition-colors duration-300',
                  isCompleted ? 'bg-primary' : 'bg-muted-foreground/20'
                )}
                aria-hidden="true"
              />
            )}
          </Fragment>
        );
      })}
    </div>
  );
}
