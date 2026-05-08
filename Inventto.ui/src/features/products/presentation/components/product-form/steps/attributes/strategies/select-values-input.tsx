import { useState } from 'react';
import { X } from 'lucide-react';

import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';

type SelectValuesInputProps = {
  values: string[];
  onChange: (values: string[]) => void;
};

export function SelectValuesInput({
  values,
  onChange
}: SelectValuesInputProps) {
  const [inputValue, setInputValue] = useState('');

  const handleAddValue = () => {
    const normalizedValue = inputValue.trim();

    if (!normalizedValue) return;

    const alreadyExists = values.some(
      (value) => value.trim().toLowerCase() === normalizedValue.toLowerCase()
    );

    if (alreadyExists) {
      setInputValue('');
      return;
    }

    onChange([...values, normalizedValue]);
    setInputValue('');
  };

  const handleRemoveValue = (valueToRemove: string) => {
    onChange(values.filter((value) => value !== valueToRemove));
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              handleAddValue();
            }
          }}
          placeholder="Ex: P, M, G"
        />

        <Button
          type="button"
          variant="outline"
          onClick={handleAddValue}
          disabled={!inputValue.trim()}
        >
          Adicionar
        </Button>
      </div>

      {values.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {values.map((value) => (
            <div
              key={value}
              className="flex items-center gap-1 rounded-md border px-2 py-1 text-sm"
            >
              <span>{value}</span>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-5 px-1 text-muted-foreground hover:text-destructive"
                onClick={() => handleRemoveValue(value)}
                aria-label={`Remover opção ${value}`}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
