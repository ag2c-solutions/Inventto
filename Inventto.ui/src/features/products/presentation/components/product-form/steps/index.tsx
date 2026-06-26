import type { ProductFormStep } from '../types';

import { ProductBasicInfo } from './basic-infos';
import { ProductImages } from './images';
import { ProductSummary } from './summary';
import { ProductVariations } from './variations';

const basicInfoStep: ProductFormStep = {
  id: 'BasicInfo',
  label: 'Informações',
  component: <ProductBasicInfo key="StepBasicInfo" />
};

const imagesStep: ProductFormStep = {
  id: 'Images',
  label: 'Imagens',
  component: <ProductImages key="StepImages" />
};

const variationsStep: ProductFormStep = {
  id: 'Variations',
  label: 'Variações',
  component: <ProductVariations key="StepVariations" />
};

const summaryStep: ProductFormStep = {
  id: 'Summary',
  label: 'Resumo',
  component: <ProductSummary key="StepSummary" />
};

export const stepsWithoutVariants: ProductFormStep[] = [
  basicInfoStep,
  imagesStep,
  summaryStep
];

export const stepsWithVariants: ProductFormStep[] = [
  basicInfoStep,
  imagesStep,
  variationsStep,
  summaryStep
];
