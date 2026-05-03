import { type KeyboardEvent, useState } from 'react';
import { X } from 'lucide-react';

import { Badge } from '@/shared/components/ui/badge';
import { Input } from '@/shared/components/ui/input';

type TextValuesInputProps = {
  values: string[];
  onChange: (values: string[]) => void;
  type?: 'text' | 'number';
};

export function TextValuesInput({
  values,
  onChange,
  type = 'text'
}: TextValuesInputProps) {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addValue();
    }
  };

  const addValue = () => {
    const trimmed = inputValue.trim();
    if (trimmed && !values.includes(trimmed)) {
      onChange([...values, trimmed]);
      setInputValue('');
    }
  };

  const removeValue = (valueToRemove: string) => {
    onChange(values.filter((v) => v !== valueToRemove));
  };

  return (
    <div className="space-y-3">
      <Input
        value={inputValue}
        onChange={(e) => {
          if (type === 'number') {
            if (/^\d*$/.test(e.target.value)) {
              setInputValue(e.target.value);
            }
          } else {
            setInputValue(e.target.value);
          }
        }}
        onKeyDown={handleKeyDown}
        onBlur={addValue}
        placeholder={
          type === 'number'
            ? 'Digite um número e Enter'
            : 'Digite valor e Enter (ou vírgula)'
        }
      />
      <div className="flex flex-wrap gap-2">
        {values.map((value) => (
          <Badge key={value} variant="secondary" className="px-2 py-1 gap-1">
            {value}
            <button
              type="button"
              onClick={() => removeValue(value)}
              className="hover:text-destructive focus:outline-none"
            >
              <X className="h-3 w-3" />
              <span className="sr-only">Remover {value}</span>
            </button>
          </Badge>
        ))}
      </div>
    </div>
  );
}
