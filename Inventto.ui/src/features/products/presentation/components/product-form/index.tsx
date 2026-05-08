import {
  Wizard,
  WizardContent,
  WizardControl
} from '@/shared/components/common/wizard';

import { useProductForm } from './hook';

export function ProductForm() {
  const { steps, onSubmit, onCancel, handleNextStep } = useProductForm();

  return (
    <form className="h-full flex flex-col gap-4">
      <Wizard
        steps={steps}
        onBeforeNextStep={handleNextStep}
        onCancel={onCancel}
        onFinish={onSubmit}
      >
        <WizardContent />
        <WizardControl />
      </Wizard>
    </form>
  );
}
