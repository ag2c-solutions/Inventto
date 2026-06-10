import { useNavigate } from 'react-router';
import { toast } from 'sonner';

import { useWizard } from '@/shared/components/common/wizard';

import {
  useResendOtpMutation,
  useVerifyOtpMutation
} from '../../../../hooks/use-mutations';
import { OtpStep } from '../../../otp-step/';
import { useSignUpForm } from '../../hook';

function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!domain) return email;
  return `${local[0]}•••@${domain}`;
}

export function VerificationStep() {
  const { form } = useSignUpForm();
  const { actions: wizardActions } = useWizard();
  const navigate = useNavigate();

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
      .then(() => {
        toast.success('Conta ativada com sucesso! Bem-vindo(a).');
        navigate('/', { replace: true });
      })
      .catch(() => {
        // erro exibido via errorMessage
      });
  };

  const handleResend = () => {
    resendOtp({ email }).catch(() => {
      // erro tratado pelo MutationCache global
    });
  };

  const handleBack = () => {
    resetVerify();
    wizardActions.prevStep();
  };

  return (
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
  );
}
