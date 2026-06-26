import { ProductFormFieldImages } from './field-images';

export function ProductImages() {
  return (
    <div className="space-y-6 pb-6">
      <div>
        <h2 className="text-xl font-semibold">Imagens</h2>
        <p className="text-sm text-muted-foreground">
          Arraste arquivos ou selecione do dispositivo. O envio acontece em
          background.
        </p>
      </div>

      <ProductFormFieldImages />
    </div>
  );
}
