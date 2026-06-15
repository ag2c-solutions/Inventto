import { ResetPasswordForm } from '../../components/forms/reset-password';
import { InvalidResetLink } from '../../components/invalid-reset-link';
import { useAuth } from '../../hooks/use-auth';

export function ResetPasswordPage() {
  const { isRecoverySession, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div
        className="flex w-full items-center justify-center py-16"
        role="status"
        aria-label="Validando link de redefinição"
      >
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="bg-background">
      {isRecoverySession ? <ResetPasswordForm /> : <InvalidResetLink />}
    </div>
  );
}
