import { describe, expect, it } from 'vitest';

import { productFactory } from '../../../../../tests/factories/product.factory';

import { getInitialProductFormData } from './get-initial-data';

describe('getInitialProductFormData', () => {
  it('should return undefined when there is no draft nor product', () => {
    const result = getInitialProductFormData({ mode: 'Create' });

    expect(result).toBeUndefined();
  });

  it('should use the draft when in Create mode and draft has no id', () => {
    const draft = { id: undefined, name: 'Rascunho' } as never;

    const result = getInitialProductFormData({ draft, mode: 'Create' });

    expect(result).toEqual(draft);
  });

  it('should ignore the draft when in Edit mode, preferring the product', () => {
    const draft = { id: undefined, name: 'Rascunho' } as never;
    const product = productFactory.build({ name: 'Produto Real' });

    const result = getInitialProductFormData({
      draft,
      mode: 'Edit',
      product
    });

    expect(result?.name).toBe('Produto Real');
  });

  it('should map the product to form data when there is no usable draft', () => {
    const product = productFactory.build({ name: 'Produto Real' });

    const result = getInitialProductFormData({ mode: 'Edit', product });

    expect(result?.name).toBe('Produto Real');
    expect(result?.id).toBe(product.id);
  });
});
