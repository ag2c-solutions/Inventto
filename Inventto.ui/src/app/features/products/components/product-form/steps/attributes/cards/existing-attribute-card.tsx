import type { UseFormReturn } from 'react-hook-form';
import { Card, CardContent } from '@/app/components/ui/card';
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from '@/app/components/ui/form';
import { Input } from '@/app/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/app/components/ui/select';
import type { ProductFormData } from '../../../schema';
import { ProductsFormFieldAttributeValues } from '../field-attribute-values';
import type { AttributeType } from '@/app/features/products/types/models';

type ExistingAttributeCardProps = {
    form: UseFormReturn<ProductFormData>;
    index: number;
};

export function ExistingAttributeCard({ form, index }: ExistingAttributeCardProps) {
    const attributeType = form.watch(`attributes.${index}.type`);
    
    return (
        <Card className="relative overflow-hidden aspect-square w-full flex flex-col bg-muted/20">
            <CardContent className="h-full flex flex-col gap-4 p-6">
                <FormField
                    control={form.control}
                    name={`attributes.${index}.name`}
                    render={({ field }) => (
                        <FormItem className="w-full">
                            <FormLabel>Nome</FormLabel>
                            <FormControl>
                                <Input disabled placeholder="ex: Tamanho" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name={`attributes.${index}.type`}
                    render={({ field }) => (
                        <FormItem className="w-full">
                            <FormLabel>Tipo</FormLabel>
                            <FormControl>
                                <Select
                                    disabled
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    value={field.value}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Tipo" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="text">Texto</SelectItem>
                                        <SelectItem value="number">Número</SelectItem>
                                        <SelectItem value="color">Cor</SelectItem>
                                        <SelectItem value="select">Seleção</SelectItem>
                                    </SelectContent>
                                </Select>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex-1 overflow-y-auto">
                    <ProductsFormFieldAttributeValues
                        nameValues={`attributes.${index}.values`}
                        type={attributeType as AttributeType}
                    />
                </div>
            </CardContent>
        </Card>
    );
}
