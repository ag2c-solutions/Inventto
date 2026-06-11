import { createContext, type ReactNode, useContext, useState } from 'react';
import { useNavigate } from 'react-router';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, useForm, type UseFormReturn } from 'react-hook-form';

import type { WizardStep } from '@/shared/components/common/wizard';
import { formatDocument, normalizeDocument } from '@/shared/utils';

import {
  type SignUpFormValues as SignUpFormData,
  signUpSchema
} from '../../../../../domain/validators';
import { useSignUpMutation } from '../../../../hooks/use-mutations';

interface SignUpFormContextType {
  form: UseFormReturn<SignUpFormData>;
  isCnpj: boolean;
  actions: {
    handleDocumentChange: (value: string) => void;
    handleBeforeNextStep: (currentStep: WizardStep) => Promise<boolean>;
    onSubmit: () => Promise<void>;
    handleCancel: () => void;
  };
}

const SignUpFormContext = createContext<SignUpFormContextType | null>(null);

export function SignUpFormProvider({ children }: { children: ReactNode }) {
  const { mutateAsync: signUp } = useSignUpMutation();
  const [isCnpj, setIsCnpj] = useState(false);
  const navigate = useNavigate();

  const form = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    mode: 'onChange',
    defaultValues: {
      companyName: '',
      document: '',
      corporateName: '',
      businessAreaId: '',
      fullName: '',
      email: '',
      password: '',
      passwordConfirmation: '',
      acceptedTerms: false
    }
  });

  const handleDocumentChange = (value: string) => {
    form.setValue('document', formatDocument(value));

    const cleanDoc = normalizeDocument(value || '');

    if (cleanDoc.length > 11 && !isCnpj) setIsCnpj(true);
    if (cleanDoc.length <= 11 && isCnpj) setIsCnpj(false);
  };

  const handleBeforeNextStep = async (currentStep: WizardStep) => {
    if (currentStep.id === 'organization') {
      return await form.trigger([
        'companyName',
        'document',
        'businessAreaId',
        ...(isCnpj ? (['corporateName'] as const) : [])
      ]);
    }

    if (currentStep.id === 'user') {
      const isValid = await form.trigger([
        'fullName',
        'email',
        'password',
        'passwordConfirmation',
        'acceptedTerms'
      ]);

      if (!isValid) return false;

      const data = form.getValues();

      try {
        await signUp({
          companyName: data.companyName,
          document: data.document,
          fullName: data.fullName,
          email: data.email,
          password: data.password,
          businessAreaId: data.businessAreaId,
          acceptedTerms: true
        });
        return true;
      } catch {
        return false;
      }
    }

    return true;
  };

  const handleCancel = () => {
    navigate('/auth/login');
  };

  const value = {
    form,
    isCnpj,
    actions: {
      handleDocumentChange,
      handleBeforeNextStep,
      handleCancel,
      // Noop: o submit final ocorre no passo OTP (VerificationStep), não no Wizard.
      onSubmit: async () => {}
    }
  };

  return (
    <SignUpFormContext.Provider value={value}>
      <FormProvider {...form}>{children}</FormProvider>
    </SignUpFormContext.Provider>
  );
}

export function useSignUpForm() {
  const context = useContext(SignUpFormContext);

  if (!context) {
    throw new Error(
      'useSignUpForm deve ser usado dentro de um SignUpFormProvider'
    );
  }

  return context;
}
