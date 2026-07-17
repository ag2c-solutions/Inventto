import { useEffect } from 'react';
import { useWatch } from 'react-hook-form';

import { useProductForm } from '../../hook';
import { generateVariants } from '../../utils/generate-variants';
import { ProductAttributes } from '../attributes';
import { ProductVariants } from '../variants';

export function ProductVariations() {
  const { form } = useProductForm();
  const { getValues, setValue } = form;
  const attributes = useWatch({ control: form.control, name: 'attributes' });
  const sku = useWatch({ control: form.control, name: 'sku' });
  const minimumStock = useWatch({
    control: form.control,
    name: 'minimumStock'
  });

  // Regenera a grade reativamente sempre que os atributos mudam, preservando
  // os campos já preenchidos das variantes existentes.
  useEffect(() => {
    const hasCompleteAttributes =
      Array.isArray(attributes) &&
      attributes.length > 0 &&
      attributes.every(
        (attribute) =>
          attribute.name.trim() && (attribute.values?.length ?? 0) > 0
      );

    if (!hasCompleteAttributes) return;

    const variants = generateVariants({
      skuBase: sku,
      minimumStock: minimumStock ?? 0,
      attributes,
      existingVariants: getValues('variants') ?? []
    });

    setValue('variants', variants, { shouldDirty: true });
  }, [attributes, sku, minimumStock, getValues, setValue]);

  return (
    <div className="space-y-8 pb-6">
      <div>
        <h2 className="text-xl font-semibold">Atributos e variações</h2>
        <p className="text-sm text-muted-foreground">
          Defina os atributos — cor, tamanho ou outro. A grade é gerada
          automaticamente, e cada variante recebe SKU e estoque mínimo próprios.
        </p>
      </div>

      <ProductAttributes />

      <ProductVariants />
    </div>
  );
}
