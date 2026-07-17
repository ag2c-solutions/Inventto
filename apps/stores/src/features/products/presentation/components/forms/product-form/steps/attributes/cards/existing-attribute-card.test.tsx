import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import {
  productAttributeFactory,
  productWithVariantsFactory
} from '../../../../../../../tests/factories/product.factory';
import { useProductForm } from '../../../hook';
import { renderWithProductProvider } from '../../../mocks';

import { ExistingAttributeCard } from './existing-attribute-card';

function ExistingAttributeCardHarness({ index = 0 }: { index?: number }) {
  const { form } = useProductForm();

  return <ExistingAttributeCard form={form} index={index} />;
}

describe('ExistingAttributeCard', () => {
  it('should render the attribute name and type as disabled fields', () => {
    const product = productWithVariantsFactory.build({
      attributes: [productAttributeFactory.build({ name: 'Cor', type: 'text' })]
    });

    renderWithProductProvider(<ExistingAttributeCardHarness />, {
      providerProps: { mode: 'Edit', product }
    });

    expect(screen.getByLabelText('Nome do atributo')).toBeDisabled();
    expect(screen.getByLabelText('Nome do atributo')).toHaveValue('Cor');
  });
});
