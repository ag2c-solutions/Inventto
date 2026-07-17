import { LayoutGrid, List } from 'lucide-react';

import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/utils';

import type { StorefrontLayout } from '../../../domain/entities';

interface LayoutSegmentedProps {
  value: StorefrontLayout;
  onChange: (value: StorefrontLayout) => void;
  disabled?: boolean;
}

const OPTIONS: {
  value: StorefrontLayout;
  label: string;
  icon: typeof LayoutGrid;
}[] = [
  { value: 'grid', label: 'Grade', icon: LayoutGrid },
  { value: 'list', label: 'Lista', icon: List }
];

export function LayoutSegmented({
  value,
  onChange,
  disabled
}: LayoutSegmentedProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Disposição dos produtos"
      className="inline-flex gap-1 rounded-lg border bg-muted/40 p-1"
    >
      {OPTIONS.map(({ value: optionValue, label, icon: Icon }) => (
        <Button
          key={optionValue}
          type="button"
          size="sm"
          variant="ghost"
          role="radio"
          aria-checked={value === optionValue}
          disabled={disabled}
          onClick={() => onChange(optionValue)}
          className={cn(
            'gap-2',
            value === optionValue &&
              'bg-background text-foreground shadow-sm hover:bg-background'
          )}
        >
          <Icon className="size-4" />
          {label}
        </Button>
      ))}
    </div>
  );
}
