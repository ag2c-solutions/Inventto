import { useState, type KeyboardEvent } from 'react';
import { Plus, X, GripVertical } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';

type SelectValuesInputProps = {
    values: string[];
    onChange: (values: string[]) => void;
};

export function SelectValuesInput({ values, onChange }: SelectValuesInputProps) {
    const [inputValue, setInputValue] = useState('');

    const addOption = () => {
        const trimmed = inputValue.trim();
        if (trimmed && !values.includes(trimmed)) {
            onChange([...values, trimmed]);
            setInputValue('');
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addOption();
        }
    };

    const removeValue = (valueToRemove: string) => {
        onChange(values.filter((v) => v !== valueToRemove));
    };

    return (
        <div className="space-y-3">
            <div className="flex gap-2">
                <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Nome da opção"
                />
                <Button
                    type="button"
                    variant="secondary"
                    onClick={addOption}
                    disabled={!inputValue.trim()}
                >
                    <Plus className="h-4 w-4" />
                </Button>
            </div>

            <div className="space-y-2 max-h-40 overflow-y-auto">
                {values.map((value) => (
                    <div
                        key={value}
                        className="flex items-center justify-between rounded-md border p-2 text-sm bg-background"
                    >
                        <div className="flex items-center gap-2">
                            <GripVertical className="h-4 w-4 text-muted-foreground" />
                            <span>{value}</span>
                        </div>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-muted-foreground hover:text-destructive"
                            onClick={() => removeValue(value)}
                        >
                            <X className="h-3 w-3" />
                        </Button>
                    </div>
                ))}
                {values.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-2">
                        Nenhuma opção adicionada.
                    </p>
                )}
            </div>
        </div>
    );
}
