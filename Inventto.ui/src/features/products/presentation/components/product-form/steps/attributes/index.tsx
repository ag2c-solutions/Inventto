import { useMemo } from 'react';
import { useFieldArray } from 'react-hook-form';

import { Button } from '@/shared/components/ui/button';

import type { AttributeType } from '../../../../../domain/entities';
import { useGlobalAttributesQuery } from '../../../../hooks/use-query';
import { useProductForm } from '../../hook';
import type { ProductFormWithVariantsData } from '../../schema';

import { ExistingAttributeCard } from './cards/existing-attribute-card';
import {
  NewAttributeCard,
  type SystemAttribute
} from './cards/new-attribute-card';

function createEmptyAttribute(): ProductFormWithVariantsData['attributes'][number] {
  return {
    name: '',
    type: 'text',
    values: [],
    isNew: true
  };
}

function isAttributeType(value: string): value is AttributeType {
  return ['text', 'number', 'color', 'select'].includes(value);
}

export function ProductAttributes() {
  const { form, mode } = useProductForm();
  const { data: globalAttributes = [] } = useGlobalAttributesQuery();

  const systemAttributes = useMemo<SystemAttribute[]>(() => {
    return globalAttributes.map((attribute) => ({
      id: attribute.id,
      label: attribute.label,
      slug: attribute.slug,
      type: isAttributeType(attribute.type) ? attribute.type : 'text',
      values: attribute.values ?? []
    }));
  }, [globalAttributes]);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'attributes'
  });

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium">Atributos</h3>

        <p className="text-sm text-muted-foreground">
          Atributos são características do seu produto, como tamanho ou cor.
          Você pode adicionar vários atributos ao seu produto.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-8">
        {fields.map((field, index) => {
          const isNewAttribute = mode === 'Create' || field.isNew === true;

          if (isNewAttribute) {
            return (
              <NewAttributeCard
                key={field.id}
                form={form}
                index={index}
                onRemove={remove}
                systemAttributes={systemAttributes}
              />
            );
          }

          return (
            <ExistingAttributeCard key={field.id} form={form} index={index} />
          );
        })}
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={() => append(createEmptyAttribute())}
        className="w-full md:w-auto"
      >
        + Adicionar atributo
      </Button>
    </div>
  );
}
