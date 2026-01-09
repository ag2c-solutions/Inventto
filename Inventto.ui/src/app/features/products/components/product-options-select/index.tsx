import { Button } from '@/app/components/ui/button';
import type { IProductAttribute } from '../../types/models';
import { Separator } from '@/app/components/ui/separator';
import { parseColorValue } from '../../utils';

type TProductOptionsSelect = {
  attributes: IProductAttribute[];
  selectedOptions: Record<string, string>;
  handleSelectOption: (attributeName: string, value: string) => void;
};
export function ProductOptionsSelect({
  attributes,
  selectedOptions,
  handleSelectOption
}: TProductOptionsSelect) {
  return (
    <div className="space-y-3">
      {attributes.map((attr) => (
        <div key={attr.name}>
          <p className="font-medium">{attr.name}</p>
          <div className="flex flex-wrap gap-2">
            {attr.values.map((value) => {
              const val = value.trim();
              const isActive = selectedOptions[attr.name] === val;
              const isColor = val.includes('#');

              return isColor ? (
                <Button
                  type="button"
                  key={val}
                  variant={isActive ? 'ghost' : 'outline'}
                  size="sm"
                  className={isActive ? 'border-2 border-primary rounded-full aspect-square p-1' : 'rounded-full aspect-square p-1'}
                  onClick={() => handleSelectOption(attr.name, val)}
                >
                  <div
                    className="h-full w-full aspect-square rounded-full"
                    style={{ backgroundColor: parseColorValue(val).hex }}
                  />
                </Button>
              ):(
                <Button
                  type="button"
                  key={val}
                  variant={isActive ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleSelectOption(attr.name, val)}
                >
                  {val}
                </Button>
              )

            })}
          </div>
        </div>
      ))}
      <Separator />
    </div>
  );
}
