import { createContext, type ReactNode, useContext, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, useForm, type UseFormReturn } from 'react-hook-form';

import { type WizardStep } from '@/shared/components/common/wizard';
import { useDebouncedValue } from '@/shared/hooks/use-debounced-value';
import { useFormDraft } from '@/shared/hooks/use-form-draft';

import type { IProduct } from '../../../../domain/entities';
import { LOCAL_STORAGE_KEY } from '../../../constants/product-form-key';
import {
  useCreateProductMutation,
  useUpdateProductMutation
} from '../../../hooks/use-mutations';
import {
  useProductMovementsQuery,
  useSkuAvailabilityQuery
} from '../../../hooks/use-queries';
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

export type SkuAvailabilityStatus =
  | 'idle'
  | 'checking'
  | 'available'
  | 'duplicate';

type TProductFormContext = {
  form: UseFormReturn<ProductFormData>;
  steps: ProductFormStep[];
  mode: TProductFormModes;
  product?: IProduct;
  skuAvailabilityStatus: SkuAvailabilityStatus;
  onSubmit: () => void;
  clearFormData: () => void;
  onCancel: () => void;
  handleNameChange: (name: string) => void;
  handleVariantSwitch: (checked: boolean) => void;
  handleNextStep: (step: WizardStep) => Promise<boolean>;
  hasMovements: boolean;
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
  const skuValue = watch('sku') ?? '';

  const steps = useMemo(() => getProductFormSteps(hasVariants), [hasVariants]);

  const debouncedSku = useDebouncedValue(skuValue.trim(), 400);

  const isSkuDirty = getFieldState('sku').isDirty;

  const skuCheckEnabled =
    (mode === 'Create' || isSkuDirty) && debouncedSku.length > 0;

  const {
    data: isSkuAvailable,
    isFetching: isCheckingSku,
    isError: isSkuCheckError
  } = useSkuAvailabilityQuery({
    sku: debouncedSku,
    excludeProductId: product?.id,
    enabled: skuCheckEnabled
  });

  const { data: hasMovements = false } = useProductMovementsQuery(
    mode === 'Edit' ? product?.id : undefined
  );

  const skuAvailabilityStatus: SkuAvailabilityStatus = useMemo(() => {
    if (!skuCheckEnabled) return 'idle';
    if (skuValue.trim() !== debouncedSku || isCheckingSku) return 'checking';
    if (isSkuCheckError) return 'idle';
    if (isSkuAvailable === false) return 'duplicate';
    if (isSkuAvailable === true) return 'available';
    return 'idle';
  }, [
    skuCheckEnabled,
    skuValue,
    debouncedSku,
    isCheckingSku,
    isSkuCheckError,
    isSkuAvailable
  ]);

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
      const isValid = await form.trigger(['name', 'sku', 'categories']);

      if (!isValid) return false;

      if (skuAvailabilityStatus === 'duplicate') {
        form.setError('sku', {
          type: 'manual',
          message: 'Já existe um produto com este SKU.'
        });

        return false;
      }

      return true;
    }

    if (step.id === 'Variations') {
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
    skuAvailabilityStatus,
    hasMovements,
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
