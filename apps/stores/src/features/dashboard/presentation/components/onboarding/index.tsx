import { Sparkles } from 'lucide-react';

import type { OnboardingStatus } from '../../../domain/entities';
import { OnboardingService } from '../../../domain/services';
import { OnboardingStepCard } from '../onboarding-step';

interface OnboardingProps {
  status: OnboardingStatus;
}

export function Onboarding({ status }: OnboardingProps) {
  const steps = OnboardingService.resolveSteps(status);

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-8 py-10">
      <div className="flex flex-col items-center gap-4 text-center">
        <span className="flex size-14 text-sidebar-foreground items-center justify-center rounded-2xl border bg-sidebar">
          <Sparkles className="size-6" />
        </span>
        <div>
          <h1 className="text-[27px] text-sidebar-foreground font-bold tracking-tight">
            Vamos preparar sua loja.
          </h1>
          <p className="mt-2 text-sm text-sidebar-foreground/70">
            Três passos para começar a vender. Conclua na ordem — cada um
            destrava o próximo.
          </p>
        </div>
      </div>

      <div className="flex w-full flex-col gap-3">
        {steps.map((step, index) => (
          <OnboardingStepCard key={step.id} step={step} index={index} />
        ))}
      </div>
    </div>
  );
}
