import { SignUpForm } from '../../components/forms/signup';
import { SignUpFormProvider } from '../../components/forms/signup/hook';

export function SignUpPage() {
  return (
    <div className="w-full max-w-lg">
      <SignUpFormProvider>
        <SignUpForm />
      </SignUpFormProvider>
    </div>
  );
}
