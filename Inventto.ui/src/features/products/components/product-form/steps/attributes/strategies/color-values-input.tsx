import { useState } from 'react';
import { Plus, X } from 'lucide-react';

import { parseColorValue } from '@/features/products/utils';

import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/shared/components/ui/popover';

type ColorValuesInputProps = {
  values: string[];
  onChange: (values: string[]) => void;
};

export function ColorValuesInput({ values, onChange }: ColorValuesInputProps) {
  const [open, setOpen] = useState(false);
  const [colorName, setColorName] = useState('');
  const [colorHex, setColorHex] = useState('#000000');

  const handleAdd = () => {
    if (!colorName || !colorHex) return;

    const newValue = `${colorName}|${colorHex}`;

    if (!values.includes(newValue)) {
      onChange([...values, newValue]);
    }

    setColorName('');
    setColorHex('#000000');
    setOpen(false);
  };

  const removeValue = (valueToRemove: string) => {
    onChange(values.filter((v) => v !== valueToRemove));
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {values.map((value) => {
          const { name, hex } = parseColorValue(value);
          return (
            <Badge
              key={value}
              variant="secondary"
              className="flex items-center gap-2 pl-1 pr-1.5 py-1"
            >
              <div
                className="h-4 w-4 rounded-full border shadow-sm"
                style={{ backgroundColor: hex }}
              />
              <span className="text-sm">{name}</span>
              <button
                type="button"
                onClick={() => removeValue(value)}
                className="ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20"
              >
                <X className="h-3 w-3 text-muted-foreground/70" />
                <span className="sr-only">Remover {name}</span>
              </button>
            </Badge>
          );
        })}

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 border-dashed">
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Cor
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="start">
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium leading-none">Add New Color</h4>
                <p className="text-sm text-muted-foreground">
                  Enter a color name and select its hex code.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="colorName">Color Name</Label>
                <Input
                  id="colorName"
                  placeholder="e.g., Midnight"
                  value={colorName}
                  onChange={(e) => setColorName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="colorHex">Hex Code</Label>
                <div className="flex gap-2">
                  <Input
                    id="colorHex"
                    value={colorHex}
                    onChange={(e) => setColorHex(e.target.value)}
                    placeholder="#RRGGBB"
                    className="flex-1"
                    maxLength={7}
                  />
                  <Input
                    type="color"
                    value={colorHex}
                    onChange={(e) => setColorHex(e.target.value)}
                    className="h-10 w-12 p-1 cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 rounded-md border bg-muted/50 p-2">
                <div
                  className="h-6 w-6 rounded-full border shadow-sm"
                  style={{ backgroundColor: colorHex }}
                />
                <span className="text-sm font-medium">Preview</span>
              </div>

              <div className="flex justify-between gap-2">
                <Button
                  variant="ghost"
                  onClick={() => setOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAdd}
                  disabled={!colorName || !colorHex}
                  className="flex-1"
                >
                  Save
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
