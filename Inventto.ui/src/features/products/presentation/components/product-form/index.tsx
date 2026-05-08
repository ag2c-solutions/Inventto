import {
  Wizard,
  WizardContent,
  WizardControl,
  WizardHeader
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
        <WizardHeader className="px-1" />
        <WizardContent />
        <WizardControl />
      </Wizard>
    </form>
  );
}
