import { useFieldArray } from 'react-hook-form';

import { useGlobalAttributesQuery } from '@/features/products/hooks/use-query';

import { Button } from '@/shared/components/ui/button';

import { useProductForm } from '../../hook';

import { ExistingAttributeCard } from './cards/existing-attribute-card';
import { NewAttributeCard } from './cards/new-attribute-card';

export function ProductAttributes() {
  const { form, mode } = useProductForm();
  const { data: systemAttributes } = useGlobalAttributesQuery();
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'attributes'
  });

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium">Attributos</h3>
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
                systemAttributes={systemAttributes || []}
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
        onClick={() =>
          append({
            name: '',
            type: 'text',
            values: [] as string[],
            isNew: true
          } as any)
        }
        className="w-full md:w-auto"
      >
        + Adicionar atributo
      </Button>
    </div>
  );
}
