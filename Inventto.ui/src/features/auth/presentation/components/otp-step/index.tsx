import { REGEXP_ONLY_DIGITS } from 'input-otp';
import { Mail } from 'lucide-react';

import { SubmittingButton } from '@/shared/components/common/submitting-button';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot
} from '@/shared/components/ui/input-otp';
import { cn } from '@/shared/utils';

import { useOtpStep } from './hooks/use-otp-step';

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
  const isComplete = code.length === 8;

  return (
    <div className="flex flex-col items-center gap-6 w-full pt-6">
      <div
        className="flex items-center justify-center size-[72px] rounded-full border border-slate-200 bg-transparent"
        aria-hidden="true"
      >
        <Mail className="size-8 text-muted-foreground stroke-[1.5]" />
      </div>

      <div className="flex flex-col items-center gap-2 text-center max-w-sm">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">
          {title}
        </h2>
        <p className="text-[15px] text-muted-foreground leading-relaxed">
          {sub}
        </p>
      </div>

      <div className="flex flex-col items-center gap-2 w-full mt-2">
        <InputOTP
          maxLength={8}
          value={code}
          onChange={handleCodeChange}
          disabled={isSending}
          inputMode="numeric"
          pattern={REGEXP_ONLY_DIGITS}
          aria-label="Código de verificação de 8 dígitos"
          aria-invalid={isError || undefined}
          autoFocus
        >
          <InputOTPGroup className="gap-1 sm:gap-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <InputOTPSlot
                key={i}
                index={i}
                className={cn(
                  'size-10 sm:size-12 rounded-lg border border-slate-300 text-xl font-medium',
                  'first:rounded-lg first:border last:rounded-lg last:border',
                  isError && 'border-[#A24444] bg-[#FDF3F3] text-[#A24444]'
                )}
                aria-label={`Dígito ${i + 1}`}
              />
            ))}
          </InputOTPGroup>
        </InputOTP>
      </div>

      <div className="flex flex-col items-center gap-4 w-full max-w-[400px] mt-4">
        <SubmittingButton
          type="button"
          className="w-full h-10 text-base font-semibold rounded-xl bg-primary"
          loadingLabel={'Verificando...'}
          label={ctaLabel}
          state={isSending}
          onClick={handleSubmit}
          disabled={!isComplete || isSending}
          aria-busy={isSending}
        />

        <div className="flex flex-col items-center gap-2 w-full pt-2">
          <button
            type="button"
            disabled={cooldown > 0 || isSending}
            onClick={handleResend}
            className="text-[15px] font-medium text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
          >
            {cooldown > 0
              ? `Reenviar código (${cooldown}s)`
              : 'Não recebeu? Reenviar código'}
          </button>

          {showBack && (
            <button
              type="button"
              onClick={onBack}
              className="text-[15px] font-medium text-muted-foreground hover:text-foreground transition-colors mt-2"
            >
              {backLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
