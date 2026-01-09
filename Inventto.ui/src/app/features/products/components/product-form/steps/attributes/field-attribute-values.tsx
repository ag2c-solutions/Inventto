import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/app/components/ui/form';
import { useProductForm } from '../../hook';
import { TextValuesInput } from './strategies/text-values-input';
import { ColorValuesInput } from './strategies/color-values-input';
import { SelectValuesInput } from './strategies/select-values-input';
import type { AttributeType } from '@/app/features/products/types/models';

type TProductsFormFieldAttributeValues = {
  nameValues: `attributes.${number}.values`;
  type: AttributeType;
};

export function ProductsFormFieldAttributeValues({
  nameValues,
  type
}: TProductsFormFieldAttributeValues) {
  const { form } = useProductForm();
  const renderStrategy = (
    value: string[],
    onChange: (value: string[]) => void
  ) => {
    switch (type) {
      case 'color':
        return <ColorValuesInput values={value} onChange={onChange} />;
      case 'select':
        return <SelectValuesInput values={value} onChange={onChange} />;
      case 'number':
        return (
          <TextValuesInput values={value} onChange={onChange} type="number" />
        );
      case 'text':
      default:
        return <TextValuesInput values={value} onChange={onChange} />;
    }
  };

  return (
    <div>
      <FormField
        control={form.control}
        name={nameValues}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Valores</FormLabel>
            <FormControl>
              {renderStrategy(field.value || [], field.onChange)}
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

