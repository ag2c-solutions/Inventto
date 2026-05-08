import { useState } from 'react';

import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/shared/components/ui/dialog';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { parseColorValue } from '@/shared/utils/parses/color-value';

type ColorValuesInputProps = {
  values: string[];
  onChange: (values: string[]) => void;
};

export function ColorValuesInput({ values, onChange }: ColorValuesInputProps) {
  const [open, setOpen] = useState(false);
  const [colorName, setColorName] = useState('');
  const [colorHex, setColorHex] = useState('#000000');

  const handleAddColor = () => {
    const normalizedName = colorName.trim();

    if (!normalizedName || !colorHex) return;

    const newValue = `${normalizedName}|${colorHex}`;

    onChange([...values, newValue]);

    setColorName('');
    setColorHex('#000000');
    setOpen(false);
  };

  const handleRemoveColor = (valueToRemove: string) => {
    onChange(values.filter((value) => value !== valueToRemove));
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {values.map((value) => {
          const color = parseColorValue(value);

          return (
            <div
              key={value}
              className="flex items-center gap-2 rounded-md border px-2 py-1 text-sm"
            >
              <span
                className="h-4 w-4 rounded-full border"
                style={{ backgroundColor: color.hex }}
              />

              <span>{color.name}</span>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-5 px-1 text-muted-foreground hover:text-destructive"
                onClick={() => handleRemoveColor(value)}
                aria-label={`Remover cor ${color.name}`}
              >
                ×
              </Button>
            </div>
          );
        })}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button type="button" variant="outline" size="sm">
            Adicionar cor
          </Button>
        </DialogTrigger>

        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar nova cor</DialogTitle>

            <DialogDescription>
              Informe o nome da cor e selecione o código hexadecimal.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="color-name">Nome da cor</Label>
              <Input
                id="color-name"
                value={colorName}
                onChange={(event) => setColorName(event.target.value)}
                placeholder="Ex: Azul marinho"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="color-hex">Código hexadecimal</Label>
              <Input
                id="color-hex"
                type="color"
                value={colorHex}
                onChange={(event) => setColorHex(event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Prévia</Label>

              <div className="flex items-center gap-2 rounded-md border p-3">
                <span
                  className="h-6 w-6 rounded-full border"
                  style={{ backgroundColor: colorHex }}
                />

                <span className="text-sm text-muted-foreground">
                  {colorName.trim() || 'Nome da cor'}
                </span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>

            <Button
              type="button"
              onClick={handleAddColor}
              disabled={!colorName.trim() || !colorHex}
            >
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
