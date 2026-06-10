import { SignUpForm } from '../../components/signup-form';
import { SignUpFormProvider } from '../../components/signup-form/hook';

export function SignUpPage() {
  return (
    <div className="w-full max-w-lg">
      <SignUpFormProvider>
        <SignUpForm />
      </SignUpFormProvider>
    </div>
  );
}
