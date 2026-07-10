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
    <div className="flex flex-col gap-1.5">
      <div className="flex w-fit overflow-hidden rounded-md border">
        <button
          type="button"
          aria-label="Diminuir quantidade"
          disabled={decrementDisabled}
          onClick={onDecrement}
          className="flex h-9 w-9 items-center justify-center border-r transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Minus className="h-3.5 w-3.5" />
        </button>

        <span
          className="flex min-w-[2.5rem] items-center justify-center border-r px-2 text-sm font-medium"
          aria-live="polite"
        >
          {value}
        </span>

        <button
          type="button"
          aria-label="Aumentar quantidade"
          disabled={incrementDisabled}
          onClick={onIncrement}
          className="flex h-9 w-9 items-center justify-center transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>

      {helperText && (
        <span className="text-xs text-amber-600">{helperText}</span>
      )}
    </div>
  );
}
