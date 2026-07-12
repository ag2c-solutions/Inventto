import { CheckCircle2, Loader2, XCircle } from 'lucide-react';

import { Input } from '@/shared/components/ui/input';

import type { SlugFieldState } from './hooks/use-slug-availability';

interface SlugFieldProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  state: SlugFieldState;
  disabled?: boolean;
}

// 'reserved' (quarentena RN073) usa a mesma mensagem de 'taken' — o
// wireframe só documenta 4 estados visuais (checking/ok/taken/invalid).
const ERROR_MESSAGE: Partial<Record<SlugFieldState, string>> = {
  taken: 'Este endereço já está em uso. Tente outro.',
  reserved: 'Este endereço já está em uso. Tente outro.',
  invalid: 'Use só letras minúsculas, números e hífen, de 3 a 50 caracteres.'
};

export function SlugField({
  value,
  onChange,
  onBlur,
  state,
  disabled
}: SlugFieldProps) {
  const isError =
    state === 'taken' || state === 'invalid' || state === 'reserved';

  return (
    <div className="space-y-1.5">
      <div className="flex items-center rounded-md border border-input bg-transparent focus-within:ring-1 focus-within:ring-ring">
        <span className="pl-3 text-sm text-muted-foreground select-none">
          inventto.app/
        </span>
        <div className="relative flex-1">
          <Input
            value={value}
            disabled={disabled}
            onChange={(e) => onChange(e.target.value.toLowerCase())}
            onBlur={onBlur}
            placeholder="sua-loja"
            className="border-0 pr-8 shadow-none focus-visible:ring-0"
          />
          {state === 'checking' && (
            <Loader2 className="absolute right-2.5 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
          )}
          {state === 'ok' && (
            <CheckCircle2 className="absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-emerald-600" />
          )}
          {isError && (
            <XCircle className="absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-destructive" />
          )}
        </div>
      </div>
      {isError ? (
        <p className="text-sm text-destructive">{ERROR_MESSAGE[state]}</p>
      ) : (
        <p className="text-sm text-sidebar-foreground/70">
          Endereço público da sua vitrine.
        </p>
      )}
    </div>
  );
}
