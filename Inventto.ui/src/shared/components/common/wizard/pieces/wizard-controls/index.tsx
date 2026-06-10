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
          className="w-full"
          onClick={actions.handleFinish}
          disabled={state.isLoading}
        >
          {state.isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {labels?.finish || 'Finalizar'}
        </Button>
      ) : (
        <Button
          type="button"
          className="w-full"
          onClick={actions.nextStep}
          disabled={state.isLoading}
        >
          {state.isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
          className="w-full text-muted-foreground"
          onClick={actions.prevStep}
          disabled={state.isLoading}
        >
          {labels?.back || 'Voltar'}
        </Button>
      )}

      {state.isFirstStep && (
        <p className="text-center text-sm text-muted-foreground mt-2">
          <button
            type="button"
            className="hover:underline disabled:opacity-50"
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
