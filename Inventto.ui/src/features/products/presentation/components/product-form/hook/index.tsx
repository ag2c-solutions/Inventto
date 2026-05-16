import { createContext, type ReactNode, useContext, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, useForm, type UseFormReturn } from 'react-hook-form';

import { type WizardStep } from '@/shared/components/common/wizard';
import { useFormDraft } from '@/shared/hooks/use-form-draft';

import type { IProduct } from '../../../../domain/entities';
import { LOCAL_STORAGE_KEY } from '../../../constants/product-form-key';
import {
  useCreateProductMutation,
  useUpdateProductMutation
} from '../../../hooks/use-mutations';
import { toCreateProductInput } from '../adapters/to-create-product-input';
import { toUpdateProductInput } from '../adapters/to-update-product-input';
import { type ProductFormData, productSchema } from '../schema';
import type { ProductFormStep, TProductFormModes } from '../types';
import { generateProductSku } from '../utils/generate-product-sku';
import { generateVariants } from '../utils/generate-variants';
import { getEmptyProductFormValues } from '../utils/get-empty-product-form-values';
import { getInitialProductFormData } from '../utils/get-initial-data';
import { getProductFormDefaultValues } from '../utils/get-product-form-default-values';
import { getProductFormSteps } from '../utils/get-product-form-steps';

type TProductFormContext = {
  form: UseFormReturn<ProductFormData>;
  steps: ProductFormStep[];
  mode: TProductFormModes;
  product?: IProduct;
  onSubmit: () => void;
  clearFormData: () => void;
  onCancel: () => void;
  handleNameChange: (name: string) => void;
  handleVariantSwitch: (checked: boolean) => void;
  handleNextStep: (step: WizardStep) => Promise<boolean>;
};

const ProductFormContext = createContext<TProductFormContext | null>(null);

export type ProductFormProviderProps = {
  children: ReactNode;
  mode: TProductFormModes;
  product?: IProduct;
};

export function ProductFormProvider({
  children,
  mode,
  product
}: ProductFormProviderProps) {
  const { mutateAsync: createMutate } = useCreateProductMutation();
  const { mutateAsync: updateMutate } = useUpdateProductMutation();
  const navigate = useNavigate();

  const { draft, clearDraft } = useFormDraft<ProductFormData>({
    key: LOCAL_STORAGE_KEY
  });

  const productFormData = getInitialProductFormData({ draft, mode, product });

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: getProductFormDefaultValues(productFormData)
  });

  const { watch, getFieldState, getValues, setValue } = form;

  const hasVariants = watch('hasVariants');

  const steps = useMemo(() => getProductFormSteps(hasVariants), [hasVariants]);

  useFormDraft<ProductFormData>({
    key: LOCAL_STORAGE_KEY,
    watchData: watch()
  });

  const handleNameChange = (name: string) => {
    setValue('name', name, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true
    });

    const skuStatus = getFieldState('sku');

    if (mode === 'Create' && !skuStatus.isDirty && name) {
      setValue('sku', generateProductSku(name));
    }
  };

  const handleVariantSwitch = (checked: boolean) => {
    setValue('hasVariants', checked, { shouldDirty: true });
  };

  const handleNextStep = async (step: WizardStep): Promise<boolean> => {
    if (step.id === 'BasicInfo') {
      return form.trigger(['name', 'sku', 'categories']);
    }

    if (step.id === 'Attributes') {
      const isValid = await form.trigger(['attributes']);

      if (!isValid) return false;

      const formValues = getValues();

      if (formValues.hasVariants) {
        const variants = generateVariants({
          skuBase: formValues.sku,
          minimumStock: formValues.minimumStock,
          attributes: formValues.attributes,
          existingVariants: formValues.variants
        });

        form.setValue('variants', variants, { shouldDirty: true });
      }

      return true;
    }

    if (step.id === 'Variants') {
      return form.trigger(['variants']);
    }

    return true;
  };

  const clearFormData = () => {
    form.reset(getEmptyProductFormValues());
    clearDraft();
  };

  const handleSubmit = async (data: ProductFormData) => {
    if (mode === 'Create') {
      const payload = await toCreateProductInput(data);

      await createMutate(payload);
    } else {
      const payload = await toUpdateProductInput(data);

      await updateMutate(payload);
    }

    clearFormData();
    navigate('/products');
  };

  const onCancel = () => {
    clearFormData();
    navigate('/products');
  };

  const contextValue: TProductFormContext = {
    form,
    steps,
    onSubmit: form.handleSubmit(handleSubmit),
    onCancel,
    clearFormData,
    handleVariantSwitch,
    handleNameChange,
    handleNextStep,
    mode,
    product
  };

  return (
    <ProductFormContext.Provider value={contextValue}>
      <FormProvider {...form}>{children}</FormProvider>
    </ProductFormContext.Provider>
  );
}

export const useProductForm = () => {
  const context = useContext(ProductFormContext);

  if (!context) {
    throw new Error(
      'useProductFormContext deve ser usado dentro de um ProductFormProvider'
    );
  }

  return context;
};
