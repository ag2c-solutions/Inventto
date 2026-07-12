import type { Control, FieldPath, FieldValues } from 'react-hook-form';

import { ColorPicker } from '@/shared/components/ui/color-picker';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/shared/components/ui/form';

interface ColorFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  disabled?: boolean;
}

export function ColorField<T extends FieldValues>({
  control,
  name,
  label,
  disabled
}: ColorFieldProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <ColorPicker
              value={field.value ?? '#000000'}
              onChange={field.onChange}
              disabled={disabled}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
