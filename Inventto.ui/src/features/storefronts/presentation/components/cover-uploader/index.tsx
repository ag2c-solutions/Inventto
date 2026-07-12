import { useState } from 'react';
import { ImageIcon } from 'lucide-react';

import {
  FilePicker,
  FilePickerButton,
  FilePickerError,
  FilePickerInput
} from '@/shared/components/common/file-picker';
import type { FileWithPreview } from '@/shared/components/common/file-picker/types';
import { ImageCard } from '@/shared/components/common/image-card';

const MAX_COVER_SIZE_MB = 5;

interface CoverUploaderProps {
  coverSrc?: string;
  disabled?: boolean;
  onCoverChange: (file: File) => void;
}

// Sem crop (diferente do logo/ORG-02) — a capa é só dropzone + preview,
// como no wireframe ("capa · 1200×400").
export function CoverUploader({
  coverSrc,
  disabled,
  onCoverChange
}: CoverUploaderProps) {
  const [files, setFiles] = useState<FileWithPreview[]>([]);

  function handleFilesChange(next: FileWithPreview[]) {
    const picked = next[0];
    if (picked?.file instanceof File) {
      onCoverChange(picked.file);
    }
    setFiles([]);
  }

  return (
    <div className="flex flex-col gap-2">
      {coverSrc ? (
        <ImageCard
          src={coverSrc}
          alt="Capa da vitrine"
          className="aspect-[3/1] rounded-md border"
        />
      ) : (
        <div className="flex aspect-[3/1] items-center justify-center gap-2 rounded-md border border-dashed bg-muted/20 text-sm text-muted-foreground">
          <ImageIcon className="size-4" />
          capa · 1200×400
        </div>
      )}

      <FilePicker
        files={files}
        onFilesChange={handleFilesChange}
        maxFiles={1}
        maxSizeMB={MAX_COVER_SIZE_MB}
        accept="image/png, image/jpeg, image/webp"
      >
        <FilePickerInput />
        {/* Sem <label> envolvendo o botão: <button> é "labelable" no HTML,
            então um <label> ao redor rouba o nome acessível do conteúdo. */}
        <div
          className={
            disabled ? 'w-fit pointer-events-none opacity-50' : 'w-fit'
          }
        >
          <FilePickerButton label={coverSrc ? 'Trocar capa' : 'Enviar capa'} />
        </div>
        <FilePickerError />
      </FilePicker>

      <p className="text-xs text-muted-foreground">
        PNG, JPG ou WEBP até {MAX_COVER_SIZE_MB}MB.
      </p>
    </div>
  );
}
