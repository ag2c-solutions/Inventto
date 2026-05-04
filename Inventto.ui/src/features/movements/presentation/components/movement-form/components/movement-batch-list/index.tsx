import { Trash2 } from 'lucide-react';

import { ImageCard } from '@/shared/components/common/image-card';
import { VariantOptionBadge } from '@/shared/components/common/variants-options-badge';
import { Button } from '@/shared/components/ui/button';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/shared/components/ui/table';

import { useMovementForm } from '../../hooks';

export function MovementBatchList() {
  const { form, actions } = useMovementForm();
  const items = form.watch('items');

  if (!items || items.length === 0) return null;

  return (
    <div className="border rounded-lg overflow-hidden bg-card">
      <ScrollArea className="max-h-[50vh]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Produto</TableHead>
              <TableHead>Detalhes</TableHead>
              <TableHead>Variação</TableHead>
              <TableHead className="text-right">Qtd.</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item, index) => (
              <TableRow
                key={`${item.productId}-${item.variantId || 'simple'}-${index}`}
              >
                <TableCell>
                  {item.productImage && (
                    <div className="h-10 w-10 rounded-md overflow-hidden border bg-muted">
                      <ImageCard
                        src={item.productImage}
                        alt={item.productName}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                </TableCell>

                <TableCell className="font-medium">
                  {item.productName}
                </TableCell>

                <TableCell>
                  {item.variantOptions && item.variantOptions.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {item.variantOptions.map((opt) => (
                        <VariantOptionBadge
                          key={`${opt.name}-${opt.value}`}
                          option={opt}
                        />
                      ))}
                    </div>
                  ) : item.variantName ? (
                    <span className="text-sm text-muted-foreground">
                      {item.variantName}
                    </span>
                  ) : (
                    <span className="text-muted-foreground italic text-xs">
                      Item único
                    </span>
                  )}
                </TableCell>

                <TableCell className="text-right font-bold">
                  {item.quantity}
                </TableCell>

                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => actions.removeItem(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
}
