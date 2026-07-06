import { useFilePickerContext } from '@/shared/components/common/file-picker/hooks';

import { ImageCard } from '../../../../../image-card';

export function ImageGrid({ hasVariants }: { hasVariants: boolean }) {
  const [{ files }, { setPrimaryFile, removeFile }] = useFilePickerContext();

  if (files.length === 0) return null;

  return (
    <div className="space-y-2 pt-4">
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {files.map((file) => (
          <ImageCard
            key={file.id}
            file={file}
            showActions={!hasVariants}
            onSetPrimary={setPrimaryFile}
            onRemove={removeFile}
          />
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        {hasVariants
          ? 'Galeria do produto. A capa de cada variante é definida na etapa "Variações".'
          : 'Passe o mouse em uma imagem para definir a capa (estrela) ou removê-la.'}
      </p>
    </div>
  );
}
