import type { ReactNode } from 'react';

export type ProductFormStep = {
  id: 'BasicInfo' | 'Images' | 'Variations' | 'Summary';
  label: 'Informações' | 'Imagens' | 'Variações' | 'Resumo';
  component: ReactNode;
};

export type TProductFormModes = 'Create' | 'Edit';
