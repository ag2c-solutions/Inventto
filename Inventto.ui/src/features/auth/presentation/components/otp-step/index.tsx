import { REGEXP_ONLY_DIGITS } from 'input-otp';
import { InfoIcon, Mail } from 'lucide-react';

import { SubmittingButton } from '@/shared/components/common/submitting-button';
import { Button } from '@/shared/components/ui/button';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot
} from '@/shared/components/ui/input-otp';
import { cn } from '@/shared/utils';

import { useOtpStep } from './use-otp-step';

export interface OtpStepProps {
  title: string;
  sub: string;
  ctaLabel: string;
  isSending?: boolean;
  errorMessage?: string | null;
  showBack?: boolean;
  backLabel?: string;
  onSubmit: (code: string) => Promise<void>;
  onResend: () => void;
  onBack?: () => void;
}

export function OtpStep({
  title,
  sub,
  ctaLabel,
  isSending = false,
  errorMessage,
  showBack = false,
  backLabel = 'Voltar',
  onSubmit,
  onResend,
  onBack
}: OtpStepProps) {
  const { code, cooldown, handleCodeChange, handleResend, handleSubmit } =
    useOtpStep({ onSubmit, onResend });

  const isError = Boolean(errorMessage);
  const isComplete = code.length === 6;

  return (
    <div className="flex flex-col items-center gap-5 w-full pt-10">
      <div
        className="flex items-center justify-center size-16 rounded-full bg-muted"
        aria-hidden="true"
      >
        <Mail className="size-7 text-muted-foreground" />
      </div>

      <div className="flex flex-col items-center gap-1 text-center">
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        <p className="text-sm text-muted-foreground">{sub}</p>
      </div>

      <div className="flex flex-col items-center gap-2 w-full">
        <InputOTP
          maxLength={6}
          value={code}
          onChange={handleCodeChange}
          disabled={isSending}
          inputMode="numeric"
          pattern={REGEXP_ONLY_DIGITS}
          aria-label="Código de verificação de 6 dígitos"
          aria-invalid={isError || undefined}
          autoFocus
        >
          <InputOTPGroup className="gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <InputOTPSlot
                key={i}
                index={i}
                className={cn(
                  'size-12 rounded-xl border border-input text-base font-semibold',
                  'first:rounded-xl first:border last:rounded-xl last:border',
                  isError && 'border-destructive bg-destructive/5'
                )}
                aria-label={`Dígito ${i + 1}`}
              />
            ))}
          </InputOTPGroup>
        </InputOTP>

        {isError && (
          <p
            role="alert"
            aria-live="assertive"
            className="text-sm text-destructive items-center flex gap-1.5"
          >
            <InfoIcon className="size-4 mt-0.5" /> {errorMessage}
          </p>
        )}
      </div>

      <div className="flex flex-col items-center gap-2 w-full max-w-84">
        <SubmittingButton
          type="button"
          className="w-full h-9"
          loadingLabel={'Verificando...'}
          label={ctaLabel}
          state={isSending}
          onClick={handleSubmit}
          disabled={!isComplete || isSending}
          aria-busy={isSending}
        />

        <div className="flex items-center gap-3 justify-between w-full ">
          <Button
            type="button"
            variant="link"
            size="sm"
            disabled={cooldown > 0 || isSending}
            onClick={handleResend}
            className="text-muted-foreground"
          >
            {cooldown > 0
              ? `Reenviar código (${cooldown}s)`
              : 'Não recebeu? Reenviar código'}
          </Button>

          {showBack && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="text-muted-foreground"
            >
              {backLabel}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
