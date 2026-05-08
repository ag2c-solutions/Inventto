import { Button } from '@/shared/components/ui/button';
import { Separator } from '@/shared/components/ui/separator';
import { parseColorValue } from '@/shared/utils/parses/color-value';

import type { AttributeType } from '../../../domain/entities';

type ProductOptionAttribute = {
  id?: string;
  name: string;
  slug?: string;
  type: AttributeType;
  values: string[];
};

type ProductOptionsSelectProps = {
  attributes: ProductOptionAttribute[];
  selectedOptions: Record<string, string>;
  onSelectOption: (attributeName: string, value: string) => void;
};

export function ProductOptionsSelect({
  attributes,
  selectedOptions,
  onSelectOption
}: ProductOptionsSelectProps) {
  return (
    <div className="space-y-3">
      {attributes.map((attribute) => (
        <div key={attribute.id}>
          <p className="font-medium">{attribute.name}</p>

          <div className="flex flex-wrap gap-2">
            {attribute.values.map((value) => {
              const optionValue = value.trim();
              const isActive = selectedOptions[attribute.name] === optionValue;
              const isColor = attribute.type === 'color';

              return isColor ? (
                <Button
                  key={`${attribute.id}-${optionValue}`}
                  type="button"
                  variant={isActive ? 'ghost' : 'outline'}
                  size="sm"
                  className={
                    isActive
                      ? 'border-2 border-primary rounded-full aspect-square p-1'
                      : 'rounded-full aspect-square p-1'
                  }
                  onClick={() => onSelectOption(attribute.name, optionValue)}
                >
                  <div
                    className="h-full w-full aspect-square rounded-full"
                    style={{
                      backgroundColor: parseColorValue(optionValue).hex
                    }}
                  />
                </Button>
              ) : (
                <Button
                  key={`${attribute.id}-${optionValue}`}
                  type="button"
                  variant={isActive ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onSelectOption(attribute.name, optionValue)}
                >
                  {optionValue}
                </Button>
              );
            })}
          </div>
        </div>
      ))}

      <Separator />
    </div>
  );
}
