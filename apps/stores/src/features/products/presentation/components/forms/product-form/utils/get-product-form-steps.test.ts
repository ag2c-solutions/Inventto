import { describe, expect, it } from 'vitest';

import { getProductFormSteps } from './get-product-form-steps';

describe('getProductFormSteps', () => {
  it('returns 3 steps without variants: Informações, Imagens, Resumo', () => {
    const steps = getProductFormSteps(false);

    expect(steps.map((step) => step.id)).toEqual([
      'BasicInfo',
      'Images',
      'Summary'
    ]);
    expect(steps.map((step) => step.label)).toEqual([
      'Informações',
      'Imagens',
      'Resumo'
    ]);
  });

  it('returns 4 steps with variants: Informações, Imagens, Variações, Resumo', () => {
    const steps = getProductFormSteps(true);

    expect(steps.map((step) => step.id)).toEqual([
      'BasicInfo',
      'Images',
      'Variations',
      'Summary'
    ]);
    expect(steps.map((step) => step.label)).toEqual([
      'Informações',
      'Imagens',
      'Variações',
      'Resumo'
    ]);
  });
});
