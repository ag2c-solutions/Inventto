import { Star, X } from 'lucide-react';

import type { FileWithPreview } from '@/shared/components/common/file-picker/types';

// eslint-disable-next-line boundaries/dependencies -- TODO: presentation não deveria importar infra direto; encapsular em um hook/util compartilhado (mesmo padrão do caso local-storage)
import { CloudinaryService } from '@/infra/cloudinary';

type ImageCardProps = {
  file: FileWithPreview;
  showActions: boolean;
  onSetPrimary: (id: string) => void;
  onRemove: (id: string) => void;
};

export function ImageCard({
  file,
  showActions,
  onSetPrimary,
  onRemove
}: ImageCardProps) {
  const imageSrc =
    file.publicId && !file.publicId.startsWith('mock')
      ? CloudinaryService.createThumbnail(file.publicId, {
          width: 300,
          height: 300,
          quality: 90
        })
      : file.url;

  return (
    <div className="group relative aspect-square overflow-hidden rounded-xl border bg-muted">
      <img src={imageSrc} alt={file.name} className="size-full object-cover" />

      {file.isPrimary && (
        <div className="absolute right-2 top-2 z-10 flex size-7 items-center justify-center rounded-full bg-white shadow-md">
          <Star className="size-3.5 fill-yellow-400 text-yellow-400" />
        </div>
      )}

      {showActions && (
        <div className="absolute inset-0 flex items-center justify-center gap-3 bg-black/50 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          {file.isPrimary ? (
            <button
              type="button"
              onClick={() => onRemove(file.id)}
              aria-label="Remover imagem"
              className="flex size-9 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition-colors hover:bg-white/30"
            >
              <X className="size-4" />
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => onSetPrimary(file.id)}
                aria-label="Definir como capa"
                className="flex size-9 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition-colors hover:bg-white/30"
              >
                <Star className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => onRemove(file.id)}
                aria-label="Remover imagem"
                className="flex size-9 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition-colors hover:bg-white/30"
              >
                <X className="size-4" />
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
