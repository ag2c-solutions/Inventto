import type { ReactNode } from 'react';

export type ProductFormStep = {
  id: 'BasicInfo' | 'Attributes' | 'Variants' | 'Summary';
  label: 'Informações Básicas' | 'Atributos' | 'Variantes' | 'Resumo';
  component: ReactNode;
};

export type TProductFormModes = 'Create' | 'Edit';
