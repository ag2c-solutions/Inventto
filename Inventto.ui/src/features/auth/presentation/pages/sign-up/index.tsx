import { SignUpForm } from '../../components/sign-up-form';
import { SignUpFormProvider } from '../../components/sign-up-form/hooks/use-sign-up-form';

export function SignUpPage() {
  return (
    <div className="w-full max-w-lg">
      <SignUpFormProvider>
        <SignUpForm />
      </SignUpFormProvider>
    </div>
  );
}
