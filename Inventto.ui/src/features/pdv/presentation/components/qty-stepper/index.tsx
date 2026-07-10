import { Minus, Plus } from 'lucide-react';

interface QtyStepperProps {
  value: number;
  onIncrement: () => void;
  onDecrement: () => void;
  decrementDisabled: boolean;
  incrementDisabled: boolean;
  helperText?: string;
}

export function QtyStepper({
  value,
  onIncrement,
  onDecrement,
  decrementDisabled,
  incrementDisabled,
  helperText
}: QtyStepperProps) {
  return (
    <div className="flex items-center gap-3">
      {/* Grupo unificado: borda única com divisores verticais internos */}
      <div className="flex overflow-hidden rounded-md border">
        <button
          type="button"
          aria-label="Diminuir quantidade"
          disabled={decrementDisabled}
          onClick={onDecrement}
          className="flex h-10 w-10 items-center justify-center border-r transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Minus className="h-4 w-4" />
        </button>

        <span
          className="flex min-w-[3rem] items-center justify-center border-r px-3 text-sm font-medium"
          aria-live="polite"
        >
          {value}
        </span>

        <button
          type="button"
          aria-label="Aumentar quantidade"
          disabled={incrementDisabled}
          onClick={onIncrement}
          className="flex h-10 w-10 items-center justify-center transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {helperText && (
        <span className="text-xs text-amber-600">{helperText}</span>
      )}
    </div>
  );
}
