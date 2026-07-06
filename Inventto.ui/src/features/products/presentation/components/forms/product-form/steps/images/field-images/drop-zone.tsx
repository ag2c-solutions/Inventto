import { type DragEvent, useCallback } from 'react';
import { ImagePlus } from 'lucide-react';

import { useFilePickerContext } from '@/shared/components/common/file-picker/hooks';
import { useDropzone } from '@/shared/hooks/use-dropzone';
import { cn } from '@/shared/utils';

export function DropZone() {
  const [, { addFiles, openFileDialog }] = useFilePickerContext();

  const handleDrop = useCallback(
    (e: DragEvent<HTMLElement>) => {
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        addFiles(e.dataTransfer.files);
      }
    },
    [addFiles]
  );

  const { isDragging, dropzoneProps } = useDropzone({ onDrop: handleDrop });

  return (
    <button
      type="button"
      onClick={openFileDialog}
      data-dragging={isDragging || undefined}
      className={cn(
        'w-full flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-muted-foreground/30 py-16 transition-colors cursor-pointer',
        'hover:border-muted-foreground/50 hover:bg-muted/30',
        'data-[dragging=true]:border-primary/50 data-[dragging=true]:bg-primary/5'
      )}
      {...(dropzoneProps as React.ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      <div className="flex size-12 items-center justify-center rounded-xl border bg-background shadow-sm">
        <ImagePlus className="size-5 text-muted-foreground" />
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold">
          Arraste imagens aqui ou clique para selecionar
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          PNG, JPG ou WEBP · upload múltiplo
        </p>
      </div>
    </button>
  );
}
