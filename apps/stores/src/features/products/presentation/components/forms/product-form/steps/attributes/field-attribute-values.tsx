import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/shared/components/ui/form';

import type { AttributeType } from '../../../../../../domain/entities';
import { useProductForm } from '../../hook';

import { ATTRIBUTE_VALUES_INPUT_BY_TYPE } from './attributes-values-by-input';

type ProductsFormFieldAttributeValuesProps = {
  nameValues: `attributes.${number}.values`;
  type: AttributeType;
};

export function ProductsFormFieldAttributeValues({
  nameValues,
  type
}: ProductsFormFieldAttributeValuesProps) {
  const { form } = useProductForm();

  return (
    <FormField
      control={form.control}
      name={nameValues}
      render={({ field }) => {
        const renderInput = ATTRIBUTE_VALUES_INPUT_BY_TYPE[type];

        return (
          <FormItem>
            <FormLabel>Valores</FormLabel>

            <FormControl>
              {renderInput({
                values: field.value ?? [],
                onChange: field.onChange
              })}
            </FormControl>

            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
