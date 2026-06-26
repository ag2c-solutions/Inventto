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
      {state.isFirstStep && (
        <Button
          type="button"
          variant={'outline'}
          size={'lg'}
          onClick={actions.handleCancel}
          disabled={state.isLoading}
        >
          {labels?.cancel || 'Cancelar'}
        </Button>
      )}

      {!state.isFirstStep && (
        <Button
          type="button"
          size={'lg'}
          variant="ghost"
          onClick={actions.prevStep}
          disabled={state.isLoading}
        >
          {labels?.back || 'Voltar'}
        </Button>
      )}

      {state.isLastStep ? (
        <Button
          type="button"
          size={'lg'}
          onClick={actions.handleFinish}
          disabled={state.isLoading}
        >
          {state.isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
          {labels?.finish || 'Finalizar'}
        </Button>
      ) : (
        <Button
          type="button"
          size={'lg'}
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
    </div>
  );
}
