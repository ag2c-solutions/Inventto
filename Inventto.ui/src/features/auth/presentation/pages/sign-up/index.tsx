import { SignUpForm } from '../../components/forms/sign-up';
import { SignUpFormProvider } from '../../components/forms/sign-up/hooks/use-sign-up-form';

export function SignUpPage() {
  return (
    <div className="w-full max-w-lg">
      <SignUpFormProvider>
        <SignUpForm />
      </SignUpFormProvider>
    </div>
  );
}
