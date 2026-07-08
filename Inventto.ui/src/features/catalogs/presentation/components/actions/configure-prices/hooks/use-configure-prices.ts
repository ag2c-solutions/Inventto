import { useEffect, useMemo, useRef } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import type {
  CatalogItem,
  CatalogItemInput,
  UpdateCatalogItemsPricesPayload
} from '@/features/catalogs/domain/entities';
import {
  type ConfigurePricesFormValues,
  configurePricesSchema
} from '@/features/catalogs/domain/validators';
import {
  useAddCatalogItemsMutation,
  useUpdateCatalogItemsPricesMutation
} from '@/features/catalogs/presentation/hooks/use-mutations';

import type { AvailableProduct } from '../../../../hooks/use-queries';

export type ConfigurePricesMode = 'add' | 'edit';

interface UseConfigurePricesOptions {
  catalogId: string;
  products: AvailableProduct[];
  open: boolean;
  onSuccess: () => void;
  mode?: ConfigurePricesMode;
  /** Em modo 'edit', os itens atuais do catálogo para pré-popular os preços. */
  existingItems?: CatalogItem[];
}

export function useConfigurePrices({
  catalogId,
  products,
  open,
  onSuccess,
  mode = 'add',
  existingItems = []
}: UseConfigurePricesOptions) {
  const { mutateAsync: addItems, isPending: isAdding } =
    useAddCatalogItemsMutation(catalogId);
  const { mutateAsync: updateItems, isPending: isUpdating } =
    useUpdateCatalogItemsPricesMutation(catalogId);

  const isPending = isAdding || isUpdating;

  const defaultValues: ConfigurePricesFormValues = useMemo(() => {
    return {
      items: products.map((product) => {
        // Em modo edição, busca o preço existente para cada variante/produto
        const getExistingPrice = (variantId?: string): number | undefined => {
          if (mode !== 'edit') return product.costPrice ?? undefined;
          const match = existingItems.find(
            (i) => i.productId === product.id && i.variantId === variantId
          );
          return match?.price ?? product.costPrice ?? undefined;
        };

        const getExistingOriginalPrice = (
          variantId?: string
        ): number | null => {
          if (mode !== 'edit') return null;
          const match = existingItems.find(
            (i) => i.productId === product.id && i.variantId === variantId
          );
          return match?.originalPrice ?? null;
        };

        return {
          productId: product.id,
          priceMode: 'single' as const,
          price: getExistingPrice(undefined),
          originalPrice: getExistingOriginalPrice(undefined),
          variants: product.hasVariants
            ? product.variants.map((v) => ({
                variantId: v.id,
                included: true,
                price: getExistingPrice(v.id),
                originalPrice: getExistingOriginalPrice(v.id)
              }))
            : []
        };
      })
    };
  }, [products, existingItems, mode]);

  const form = useForm<ConfigurePricesFormValues>({
    resolver: zodResolver(configurePricesSchema),
    defaultValues,
    mode: 'onChange'
  });

  const defaultValuesRef = useRef(defaultValues);

  useEffect(() => {
    defaultValuesRef.current = defaultValues;
  }, [defaultValues]);

  useEffect(() => {
    if (open) {
      form.reset(defaultValuesRef.current);
    }
  }, [open, form]);

  // Usamos watch com caminhos exatos para garantir que o RHF dispare os re-renders corretamente
  const configuredCount = products.filter((product, index) => {
    const price = form.watch(`items.${index}.price`);
    const priceMode = form.watch(`items.${index}.priceMode`);
    const variants = form.watch(`items.${index}.variants`) ?? [];

    if (product.hasVariants) {
      const included = variants.filter((v) => v.included);
      if (included.length === 0) return false;

      if (priceMode === 'single') {
        return price !== undefined && price > 0;
      }
      return included.every((v) => v.price !== undefined && v.price > 0);
    }

    return price !== undefined && price > 0;
  }).length;

  const totalCount = products.length;
  const allConfigured = configuredCount === totalCount;

  function buildAddPayload(
    values: ConfigurePricesFormValues
  ): CatalogItemInput[] {
    const items: CatalogItemInput[] = [];

    for (const formItem of values.items) {
      if (formItem.priceMode === 'single') {
        if (formItem.price && formItem.price > 0) {
          const product = products.find((p) => p.id === formItem.productId);

          if (product?.hasVariants) {
            for (const variant of formItem.variants ?? []) {
              if (variant.included) {
                items.push({
                  productId: formItem.productId,
                  variantId: variant.variantId,
                  price: formItem.price,
                  originalPrice: formItem.originalPrice ?? null
                });
              }
            }
          } else {
            items.push({
              productId: formItem.productId,
              price: formItem.price,
              originalPrice: formItem.originalPrice ?? null
            });
          }
        }
      } else {
        for (const variant of formItem.variants ?? []) {
          if (variant.included && variant.price && variant.price > 0) {
            items.push({
              productId: formItem.productId,
              variantId: variant.variantId,
              price: variant.price,
              originalPrice: variant.originalPrice ?? null
            });
          }
        }
      }
    }

    return items;
  }

  function buildUpdatePayload(
    values: ConfigurePricesFormValues
  ): UpdateCatalogItemsPricesPayload {
    const items = buildAddPayload(values).map((newItem) => {
      // Encontra o catalogItem existente pelo variantId (ou productId para produtos simples)
      const existing = existingItems.find(
        (e) =>
          e.productId === newItem.productId &&
          (e.variantId ?? undefined) === (newItem.variantId ?? undefined)
      );

      if (!existing) {
        throw new Error(
          `Item do catálogo não encontrado para productId=${newItem.productId}`
        );
      }

      return {
        id: existing.id,
        price: newItem.price,
        originalPrice: newItem.originalPrice
      };
    });

    return { catalogId, items };
  }

  async function handleSubmit(values: ConfigurePricesFormValues) {
    if (mode === 'edit') {
      const payload = buildUpdatePayload(values);
      await updateItems(payload);
    } else {
      const items = buildAddPayload(values);
      await addItems(items);
    }
    onSuccess();
  }

  return {
    form,
    configuredCount,
    totalCount,
    allConfigured,
    isPending,
    handleSubmit: form.handleSubmit(handleSubmit)
  };
}
