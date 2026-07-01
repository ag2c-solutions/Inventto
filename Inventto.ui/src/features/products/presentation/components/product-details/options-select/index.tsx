import { Button } from '@/shared/components/ui/button';
import { parseColorValue } from '@/shared/utils/parses/color-value';

import type { AttributeType } from '../../../../domain/entities';

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
    <div className="space-y-4">
      {attributes.map((attribute) => (
        <div key={attribute.id} className="space-y-2">
          <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
            {attribute.name}
          </p>

          <div className="flex flex-wrap gap-2">
            {attribute.values.map((value) => {
              const optionValue = value.trim();
              const isActive = selectedOptions[attribute.name] === optionValue;
              const isColor = attribute.type === 'color';

              return isColor ? (
                <Button
                  key={`${attribute.id}-${optionValue}`}
                  type="button"
                  variant={isActive ? 'outline' : 'ghost'}
                  size="sm"
                  className={
                    isActive
                      ? 'rounded-full border-2 border-foreground gap-2 px-3 h-8'
                      : 'rounded-full border border-border gap-2 px-3 h-8'
                  }
                  onClick={() => onSelectOption(attribute.name, optionValue)}
                >
                  <span
                    className="inline-block w-3.5 h-3.5 rounded-full border border-border/50 shrink-0"
                    style={{
                      backgroundColor: parseColorValue(optionValue).hex
                    }}
                  />
                  {parseColorValue(optionValue).name}
                </Button>
              ) : (
                <Button
                  key={`${attribute.id}-${optionValue}`}
                  type="button"
                  variant={isActive ? 'outline' : 'outline'}
                  size="sm"
                  className={
                    isActive
                      ? 'rounded-full border-2 border-foreground font-medium'
                      : 'rounded-full border-border text-muted-foreground font-normal'
                  }
                  onClick={() => onSelectOption(attribute.name, optionValue)}
                >
                  {optionValue}
                </Button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
