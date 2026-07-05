import { useNavigate } from 'react-router';

import { useWizard } from '@/shared/components/common/wizard';

import {
  useResendOtpMutation,
  useVerifyOtpMutation
} from '../../../../../hooks/use-mutations';
import { maskEmail } from '../../../../../utils/mask-email';
import { OtpStep } from '../../../../otp-step';
import { useSignUpForm } from '../../hooks/use-sign-up-form';

export function VerificationStep() {
  const navigate = useNavigate();
  const { form } = useSignUpForm();
  const { actions: wizardActions } = useWizard();

  const email = form.getValues('email');
  const maskedEmail = maskEmail(email);

  const {
    mutateAsync: verifyOtp,
    isPending: isVerifying,
    error: verifyError,
    reset: resetVerify
  } = useVerifyOtpMutation();

  const { mutateAsync: resendOtp } = useResendOtpMutation();

  const errorMessage =
    verifyError instanceof Error ? verifyError.message : null;

  const handleSubmit = async (code: string) => {
    resetVerify();

    await verifyOtp({ email, token: code })
      .then(() => navigate('/', { replace: true }))
      .catch(() => {});
  };

  const handleResend = async () => {
    await resendOtp({ email });
  };

  const handleBack = () => {
    resetVerify();

    wizardActions.prevStep();
  };

  return (
    <div className="flex w-full flex-col">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[15px] font-medium text-muted-foreground">
          Passo 3 de 3
        </span>
      </div>

      <OtpStep
        title="Verifique seu e-mail"
        sub={`Enviamos um código de 6 dígitos para ${maskedEmail}. Digite-o abaixo para ativar sua conta.`}
        ctaLabel="Ativar minha conta"
        showBack={true}
        backLabel="Voltar para a etapa anterior"
        isSending={isVerifying}
        errorMessage={errorMessage}
        onSubmit={handleSubmit}
        onResend={handleResend}
        onBack={handleBack}
      />
    </div>
  );
}
