import type { ReactNode } from 'react';

import type { AttributeType } from '../../../../../../domain/entities';

import { ColorValuesInput } from './strategies/color-values-input';
import { SelectValuesInput } from './strategies/select-values-input';
import { TextValuesInput } from './strategies/text-values-input';

type AttributeValuesInputProps = {
  values: string[];
  onChange: (values: string[]) => void;
};

type AttributeValuesInputRenderer = (
  props: AttributeValuesInputProps
) => ReactNode;

export const ATTRIBUTE_VALUES_INPUT_BY_TYPE = {
  color: ({ values, onChange }) => (
    <ColorValuesInput values={values} onChange={onChange} />
  ),
  select: ({ values, onChange }) => (
    <SelectValuesInput values={values} onChange={onChange} />
  ),
  number: ({ values, onChange }) => (
    <TextValuesInput values={values} onChange={onChange} type="number" />
  ),
  text: ({ values, onChange }) => (
    <TextValuesInput values={values} onChange={onChange} />
  )
} satisfies Record<AttributeType, AttributeValuesInputRenderer>;
