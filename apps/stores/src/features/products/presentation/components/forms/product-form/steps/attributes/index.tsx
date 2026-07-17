import { useMemo } from 'react';
import { Plus } from 'lucide-react';
import { useFieldArray } from 'react-hook-form';

import { Button } from '@/shared/components/ui/button';

import type { AttributeType } from '../../../../../../domain/entities';
import { useGlobalAttributesQuery } from '../../../../../hooks/use-queries';
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
      label: attribute.name,
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
    <div className="space-y-3">
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

      <Button
        type="button"
        variant="outline"
        onClick={() => append(createEmptyAttribute())}
        className="w-full border-dashed md:w-auto"
      >
        <Plus className="size-4" />
        Adicionar atributo
      </Button>
    </div>
  );
}
