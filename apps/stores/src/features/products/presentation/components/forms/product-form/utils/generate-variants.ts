import type { ProductFormWithVariantsData } from '../schema';

type ProductFormVariant = ProductFormWithVariantsData['variants'][number];
type ProductFormAttribute = ProductFormWithVariantsData['attributes'][number];
type VariantOption = ProductFormVariant['options'][number];

type GenerateVariantsParams = {
  skuBase: string;
  attributes: ProductFormAttribute[];
  minimumStock?: number;
  existingVariants?: ProductFormVariant[];
  idFactory?: () => string;
};

export function generateVariants({
  skuBase,
  attributes,
  minimumStock = 0,
  existingVariants = [],
  idFactory = createVariantId
}: GenerateVariantsParams): ProductFormVariant[] {
  const normalizedAttributes = normalizeAttributes(attributes);

  if (!normalizedAttributes.length) {
    return [];
  }

  const combinations = generateCombinations(normalizedAttributes);

  if (!combinations.length) {
    return [];
  }

  const combinationsKeys = new Set(
    combinations.map((combination) => getCombinationKey(combination))
  );

  const existingVariantsByKey = new Map(
    existingVariants.map((variant) => [
      getCombinationKey(variant.options),
      variant
    ])
  );

  const usedSkus = new Set(existingVariants.map((variant) => variant.sku));

  return combinations
    .map((options) => {
      const combinationKey = getCombinationKey(options);
      const existingVariant = existingVariantsByKey.get(combinationKey);

      if (existingVariant) {
        return existingVariant;
      }

      const sku = generateVariantSku({
        skuBase,
        options,
        usedSkus
      });

      usedSkus.add(sku);

      return {
        id: idFactory(),
        sku,
        stock: 0,
        minimumStock,
        isActive: true,
        options,
        images: []
      };
    })
    .filter((variant) => {
      const key = getCombinationKey(variant.options);

      return combinationsKeys.has(key);
    });
}

function normalizeAttributes(
  attributes: ProductFormAttribute[]
): ProductFormAttribute[] {
  return attributes
    .map((attribute) => {
      const values = Array.from(
        new Set(attribute.values.map((value) => value.trim()).filter(Boolean))
      );

      return {
        ...attribute,
        name: attribute.name.trim(),
        values
      };
    })
    .filter((attribute) => attribute.name && attribute.values.length > 0);
}

function generateCombinations(
  attributes: ProductFormAttribute[]
): VariantOption[][] {
  let combinations: VariantOption[][] = [[]];

  for (const attribute of attributes) {
    const newCombinations: VariantOption[][] = [];

    for (const combination of combinations) {
      for (const value of attribute.values) {
        newCombinations.push([
          ...combination,
          {
            name: attribute.name,
            value
          }
        ]);
      }
    }

    combinations = newCombinations;
  }

  return combinations;
}

function getCombinationKey(options: VariantOption[]): string {
  return options
    .map((option) => {
      const name = normalizeKeyPart(option.name);
      const value = normalizeKeyPart(option.value);

      return `${name}:${value}`;
    })
    .sort()
    .join('|');
}

function normalizeKeyPart(value: string): string {
  return value.trim().toLowerCase();
}

function generateVariantSku({
  skuBase,
  options,
  usedSkus
}: {
  skuBase: string;
  options: VariantOption[];
  usedSkus: Set<string>;
}): string {
  const base = skuBase.trim().toUpperCase() || 'PROD';

  const suffix = options
    .map((option) => toSkuFragment(option.value))
    .filter(Boolean)
    .join('-');

  const initialSku = suffix ? `${base}-${suffix}` : base;

  if (!usedSkus.has(initialSku)) {
    return initialSku;
  }

  let counter = 2;
  let nextSku = `${initialSku}-${counter}`;

  while (usedSkus.has(nextSku)) {
    counter += 1;
    nextSku = `${initialSku}-${counter}`;
  }

  return nextSku;
}

function toSkuFragment(value: string): string {
  const normalizedValue = value
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]/g, '')
    .toUpperCase();

  return normalizedValue.slice(0, 3);
}

function createVariantId(): string {
  return (
    globalThis.crypto?.randomUUID?.() ?? `temp-${Date.now()}-${Math.random()}`
  );
}
