import React from 'react';

import { Input } from './input';

export interface MoneyInputProps
  extends Omit<React.ComponentProps<'input'>, 'value' | 'onChange' | 'type'> {
  value: number | null | undefined; // value is ALWAYS in cents! (e.g. 1500 = R$ 15,00)
  onChange: (value: number | null) => void;
}

/**
 * MoneyInput
 * Recebe o valor em centavos e formata nativamente no padrão pt-BR de moeda durante a digitação.
 * Retorna o valor atualizado em centavos.
 */
export const MoneyInput = React.forwardRef<HTMLInputElement, MoneyInputProps>(
  ({ value, onChange, className, ...props }, ref) => {
    const displayValue = React.useMemo(() => {
      if (value === null || value === undefined) return '';
      return (value / 100).toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;

      const digitsOnly = inputValue.replace(/\D/g, '');

      if (!digitsOnly) {
        onChange(null);
        return;
      }

      const cents = parseInt(digitsOnly, 10);

      onChange(cents);
    };

    return (
      <Input
        {...props}
        ref={ref}
        type="text"
        inputMode="numeric"
        value={displayValue}
        onChange={handleChange}
        className={className}
      />
    );
  }
);

MoneyInput.displayName = 'MoneyInput';
