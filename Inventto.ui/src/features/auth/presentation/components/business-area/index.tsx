import { cn } from '@/shared/utils';

export interface BusinessAreaOption {
  label: string;
  value: string;
}

export const BUSINESS_AREA_OPTIONS: BusinessAreaOption[] = [
  { label: 'Loja de roupas', value: 'clothing' },
  { label: 'Petshop', value: 'petshop' },
  { label: 'Outro', value: 'other' }
];

interface BusinessAreaButtonGroupProps {
  value?: string;
  onChange: (value: string) => void;
  errorMessage?: string | null;
}

export function BusinessAreaButtonGroup({
  value,
  onChange,
  errorMessage
}: BusinessAreaButtonGroupProps) {
  return (
    <div className="space-y-2">
      <div
        className="flex flex-wrap gap-2"
        role="radiogroup"
        aria-label="Área de atuação"
      >
        {BUSINESS_AREA_OPTIONS.map((option) => {
          const isSelected = value === option.value;

          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={isSelected}
              data-testid={`business-area-option-${option.value}`}
              onClick={() => onChange(option.value)}
              className={cn(
                'px-4 py-2 rounded-lg border text-sm font-medium transition-all duration-150',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                isSelected
                  ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                  : 'border bg-background text-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      {errorMessage && (
        <p
          role="alert"
          className="text-sm text-destructive flex items-center gap-1.5"
        >
          <span aria-hidden="true">⚠</span>
          {errorMessage}
        </p>
      )}
    </div>
  );
}
