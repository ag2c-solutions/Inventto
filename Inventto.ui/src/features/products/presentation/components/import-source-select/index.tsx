import { Label } from '@/shared/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/shared/components/ui/select';

interface ImportSourceOption {
  id: string;
  name: string;
}

interface ImportSourceSelectProps {
  value?: string;
  options: ImportSourceOption[];
  onChange: (value: string) => void;
}

export function ImportSourceSelect({
  value,
  options,
  onChange
}: ImportSourceSelectProps) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor="import-source-org">Organização de origem</Label>
      <Select value={value ?? ''} onValueChange={onChange}>
        <SelectTrigger
          id="import-source-org"
          className="w-full sm:w-[220px] sm:shrink-0"
        >
          <SelectValue placeholder="Selecione a unidade de origem" />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.id} value={option.id}>
              {option.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
