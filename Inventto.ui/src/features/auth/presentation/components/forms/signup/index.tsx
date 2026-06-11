import {
  Wizard,
  WizardContent,
  WizardControl
} from '@/shared/components/common/wizard';

import { useSignUpForm } from './hook';
import { steps } from './steps';

export function SignUpForm() {
  const { actions } = useSignUpForm();

  return (
    <div className="w-full">
      <form className=" rounded-2xl shadow p-4 px-6 w-full">
        <Wizard
          steps={steps}
          urlParamKey="step"
          onBeforeNextStep={actions.handleBeforeNextStep}
          onCancel={actions.handleCancel}
          onFinish={actions.onSubmit}
        >
          <WizardContent className="border-0 shadow-none p-0! gap-4 py-2!" />
          <WizardControl
            labels={{
              finish: 'Finalizar',
              next: 'Avançar',
              back: 'Voltar para a etapa anterior',
              cancel: 'Já tenho conta. Entrar'
            }}
          />
        </Wizard>
      </form>
    </div>
  );
}
