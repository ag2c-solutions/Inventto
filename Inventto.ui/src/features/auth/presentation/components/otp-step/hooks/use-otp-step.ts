import { useCallback, useEffect, useRef, useState } from 'react';

const COOLDOWN_SECONDS = 45;

interface UseOtpStepOptions {
  onSubmit: (code: string) => Promise<void>;
  onResend: () => void;
}

export function useOtpStep({ onSubmit, onResend }: UseOtpStepOptions) {
  const [code, setCode] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearCooldownInterval = () => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    return () => clearCooldownInterval();
  }, []);

  const startCooldown = useCallback(() => {
    clearCooldownInterval();
    setCooldown(COOLDOWN_SECONDS);

    intervalRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearCooldownInterval();

          return 0;
        }

        return prev - 1;
      });
    }, 1000);
  }, []);

  const handleResend = useCallback(() => {
    onResend();
    startCooldown();
  }, [onResend, startCooldown]);

  const handleSubmit = useCallback(async () => {
    if (code.length === 8) {
      await onSubmit(code);
    }
  }, [code, onSubmit]);

  const handleCodeChange = useCallback((value: string) => {
    setCode(value);
  }, []);

  return {
    code,
    cooldown,
    handleCodeChange,
    handleResend,
    handleSubmit
  };
}
