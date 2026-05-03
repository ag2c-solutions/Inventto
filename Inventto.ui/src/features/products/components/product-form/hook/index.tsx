import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useReducer
} from 'react';
import { useNavigate } from 'react-router';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, useForm, type UseFormReturn } from 'react-hook-form';

import { type WizardStep } from '@/shared/components/common/wizard';
import { useFormDraft } from '@/shared/hooks/use-form-draft';
import { uploadImageToCloudinary } from '@/shared/services/image-upload';

import {
  useCreateProductMutation,
  useUpdateProductMutation
} from '../../../hooks/use-query';
import type { IProduct, IProductImage } from '../../../types/models';
import { type ProductFormData, productSchema } from '../schema';
import type { ProductFormStep, TProductFormModes } from '../types';
import { generateAttributeSlug, generateVariants } from '../utils';

import { formReducer, initialState } from './form-reducer';

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

export const LOCAL_STORAGE_KEY = 'product_form_draft';

export function ProductFormProvider({
  children,
  mode,
  product
}: ProductFormProviderProps) {
  const { mutateAsync: createMutate } = useCreateProductMutation();
  const { mutateAsync: updateMutae } = useUpdateProductMutation();
  const navigate = useNavigate();
  const { draft, clearDraft } = useFormDraft<ProductFormData>({
    key: LOCAL_STORAGE_KEY
  });

  let productFormData: ProductFormData | undefined;

  if (draft && mode === 'Create' && draft?.id === undefined) {
    productFormData = draft;
  } else {
    if (product) {
      productFormData = {
        ...product,
        hasVariants: product.hasVariants ? true : false,
        variants: product.hasVariants
          ? product.variants.map((variant) => ({
              ...variant,
              stock: variant.stock ?? 0,
              costPrice: variant.costPrice ?? 0,
              minimumStock: variant.minimumStock ?? 0,
              isActive: variant.isActive ?? true,
              images: variant.images.map((img) => ({
                id: img.id,
                isPrimary: img.isPrimary ?? false
              }))
            }))
          : [],
        attributes: product.attributes.map((attr) => ({
          name: attr.name,
          type: attr.type || 'text',
          values: attr.values
        }))
      } as unknown as ProductFormData;
    }
  }

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema) as any,
    defaultValues: {
      id: productFormData?.id || '',
      name: productFormData?.name || '',
      description: productFormData?.description || '',
      categories: productFormData?.categories || [],
      sku: productFormData?.sku || '',
      minimumStock: (productFormData?.minimumStock ?? 0) as number,
      stock: (productFormData?.stock ?? 0) as number,
      costPrice: (productFormData?.costPrice ?? 0) as number,
      isActive: productFormData?.isActive ?? true,
      allImages: productFormData?.allImages || [],
      hasVariants: productFormData?.hasVariants || false,
      attributes: (productFormData as any)?.attributes || [],
      variants: (productFormData as any)?.variants || []
    }
  });

  const { watch, getFieldState, getValues, setValue } = form;

  const [steps, dispatch] = useReducer(formReducer, initialState);

  useEffect(() => {
    dispatch({
      type: 'INITIALIZE',
      payload: { hasVariants: getValues('hasVariants') || false }
    });
  }, [getValues]);

  const watchedData = watch();

  useFormDraft({
    key: LOCAL_STORAGE_KEY,
    watchData: watchedData as any
  });

  const handleNameChange = (name: string) => {
    setValue('name', name, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true
    });

    const skuStatus = getFieldState('sku');

    if (mode === 'Create' && !skuStatus.isDirty && name) {
      const generatedSku = name
        .split(' ')
        .map((string) => string.slice(0, 3).toUpperCase())
        .join('-');

      setValue('sku', generatedSku);
    }
  };

  const handleVariantSwitch = (checked: boolean) => {
    setValue('hasVariants', checked, { shouldDirty: true });

    dispatch({
      type: 'UPDATE_VARIANT_MODE',
      payload: { hasVariants: checked }
    });
  };

  const handleNextStep = async (step: WizardStep): Promise<boolean> => {
    if (step.id === 'BasicInfo') {
      return await form.trigger(['name', 'sku', 'categories']);
    }

    if (step.id === 'Attributes') {
      const isValid = await form.trigger(['attributes']);

      if (!isValid) return false;

      const formValues = getValues();
      if (formValues.hasVariants) {
        const variants = generateVariants({
          skuBase: formValues.sku,
          minimumStock: formValues.minimumStock,
          attributes: formValues.attributes as any,
          existingVariants: formValues.variants as any
        });

        form.setValue('variants', variants as any, { shouldDirty: true });
      }

      return true;
    }

    if (step.id === 'Variants') {
      return await form.trigger(['variants']);
    }

    return true;
  };

  const handleSubmit = async ({
    allImages: formImages,
    ...data
  }: ProductFormData) => {
    const processedImages: IProductImage[] = [];

    const processedAttributes = data.attributes?.map((attr) => ({
      name: attr.name,
      slug: attr.slug || generateAttributeSlug(attr.name),
      type: attr.type || 'text',
      values: attr.values
    }));

    if (formImages) {
      const uploadPromises = formImages?.map(async (image) => {
        if (image.file instanceof File) {
          const { publicId, url } = await uploadImageToCloudinary(image.file);

          return {
            id: image.id,
            name: image.name,
            url: url,
            type: image.type,
            publicId: publicId,
            isPrimary: image.isPrimary
          };
        } else {
          delete image.file;

          return image as IProductImage;
        }
      });

      const resolvedImages = await Promise.all(uploadPromises);
      processedImages.push(...resolvedImages);
    }

    processedImages.sort((a, b) => {
      if (a.isPrimary) return -1;
      if (b.isPrimary) return 1;

      return 0;
    });

    if (mode === 'Create') {
      const payload = {
        ...data,
        attributes: processedAttributes,
        allImages: processedImages
      };

      await createMutate(payload as unknown as IProduct);

      navigate('/products');
      clearFormData();
    }

    if (mode === 'Edit') {
      const payload = {
        ...data,
        attributes: processedAttributes,
        allImages: processedImages
      };
      await updateMutae(payload as unknown as IProduct);

      navigate('/products');
      clearFormData();
    }
  };

  const clearFormData = () => {
    form.reset({
      name: undefined,
      description: undefined,
      categories: [],
      sku: undefined,
      minimumStock: undefined,
      stock: undefined,
      costPrice: undefined,
      isActive: undefined,
      allImages: undefined,
      attributes: undefined,
      variants: undefined
    });
    clearDraft();
  };

  const onCancel = () => {
    clearFormData();
    navigate('/products');
  };

  const contextValue: TProductFormContext = {
    form: form as any,
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
