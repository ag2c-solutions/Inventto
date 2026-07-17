import { stepsWithoutVariants, stepsWithVariants } from '../steps';
import type { ProductFormStep } from '../types';

export function getProductFormSteps(hasVariants: boolean): ProductFormStep[] {
  return hasVariants ? stepsWithVariants : stepsWithoutVariants;
}
