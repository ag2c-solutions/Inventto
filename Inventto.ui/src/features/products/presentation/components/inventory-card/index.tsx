import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/shared/components/ui/card';

type ProductInventoryCardProps = {
  minimumStock?: number;
  stock?: number;
};

export function ProductInventoryCard({
  minimumStock = 0,
  stock = 0
}: ProductInventoryCardProps) {
  return (
    <Card className="bg-muted/50">
      <CardHeader>
        <CardTitle className="text-lg">Estoque</CardTitle>
      </CardHeader>

      <CardContent className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Estoque mínimo</p>
          <p className="font-medium">{minimumStock} un.</p>
        </div>

        <div>
          <p className="text-sm text-muted-foreground">Estoque atual</p>
          <p className="font-bold text-lg">{stock} un.</p>
        </div>
      </CardContent>
    </Card>
  );
}
