import * as React from 'react';

import { cn } from '@/shared/utils';

import { Input } from '../input';

const HEX_COLOR_REGEX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

interface ColorPickerProps {
  id?: string;
  value: string;
  onChange: (hex: string) => void;
  disabled?: boolean;
  className?: string;
}

// Swatch (<input type="color">) + campo de texto com o hex — o color
// nativo sozinho não é acessível/editável por teclado com precisão.
function ColorPicker({
  id,
  value,
  onChange,
  disabled,
  className
}: ColorPickerProps) {
  const [text, setText] = React.useState(value);

  React.useEffect(() => {
    setText(value);
  }, [value]);

  const isValid = HEX_COLOR_REGEX.test(text);

  function handleTextChange(next: string) {
    setText(next);
    if (HEX_COLOR_REGEX.test(next)) onChange(next);
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <input
        id={id}
        type="color"
        value={isValid ? text : value}
        disabled={disabled}
        onChange={(e) => {
          setText(e.target.value);
          onChange(e.target.value);
        }}
        aria-label="Selecionar cor"
        className="h-9 w-9 shrink-0 cursor-pointer rounded-md border border-border bg-transparent p-1 disabled:cursor-not-allowed disabled:opacity-50"
      />
      <Input
        value={text}
        disabled={disabled}
        onChange={(e) => handleTextChange(e.target.value)}
        placeholder="#000000"
        className="font-mono uppercase"
        aria-invalid={!isValid}
        maxLength={7}
      />
    </div>
  );
}

export { ColorPicker };
