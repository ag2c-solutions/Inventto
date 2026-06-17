import { Loader2 } from 'lucide-react';
import type { ComponentProps } from 'react';

import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/utils';

import { useWizard } from '../../hooks';

interface WizardControlProps extends ComponentProps<'div'> {
  labels?: {
    next?: string;
    back?: string;
    finish?: string;
    cancel?: string;
  };
}

export function WizardControl({
  className,
  labels,
  ...props
}: WizardControlProps) {
  const { state, actions } = useWizard();

  if (state.currentStep.hideControls) return null;

  const nextLabel = state.currentStep.nextLabel || labels?.next || 'Avançar';

  return (
    <div className={cn('flex flex-col gap-1 mt-6', className)} {...props}>
      {state.isLastStep ? (
        <Button
          type="button"
          className="w-full h-10 text-base font-semibold rounded-xl"
          onClick={actions.handleFinish}
          disabled={state.isLoading}
        >
          {state.isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
          {labels?.finish || 'Finalizar'}
        </Button>
      ) : (
        <Button
          type="button"
          className="w-full h-10 text-base font-semibold rounded-xl"
          onClick={actions.nextStep}
          disabled={state.isLoading}
        >
          {state.isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
          {nextLabel}
        </Button>
      )}

      {state.currentStep.nextHint && (
        <p className="text-center text-xs text-muted-foreground py-1">
          {state.currentStep.nextHint}
        </p>
      )}

      {!state.isFirstStep && (
        <Button
          type="button"
          variant="ghost"
          className="w-full text-muted-foreground mt-2"
          onClick={actions.prevStep}
          disabled={state.isLoading}
        >
          {labels?.back || 'Voltar'}
        </Button>
      )}

      {state.isFirstStep && (
        <p className="text-center text-[15px] text-muted-foreground mt-4">
          <button
            type="button"
            className="text-foreground underline underline-offset-4 font-medium hover:text-primary transition-colors disabled:opacity-50"
            onClick={actions.handleCancel}
            disabled={state.isLoading}
          >
            {labels?.cancel || 'Cancelar'}
          </button>
        </p>
      )}
    </div>
  );
}
