import { ImageIcon, Loader2, ZoomIn, ZoomOut } from 'lucide-react';
import Cropper from 'react-easy-crop';

import {
  FilePicker,
  FilePickerButton,
  FilePickerInput
} from '@/shared/components/common/file-picker';
import {
  Avatar,
  AvatarFallback,
  AvatarImage
} from '@/shared/components/ui/avatar';
import { Button } from '@/shared/components/ui/button';
import { Slider } from '@/shared/components/ui/slider';

import { useAvatarChange } from './hook';

type AvatarChangeFormProps = {
  onSuccess?: () => void;
  onCancel?: () => void;
};

export function AvatarChangeForm({
  onSuccess,
  onCancel
}: AvatarChangeFormProps) {
  const {
    files,
    userAvatar,
    crop,
    zoom,
    isSubmitting,
    setFiles,
    setCrop,
    setZoom,
    onCropComplete,
    handleSave
  } = useAvatarChange({ onSuccess });

  const hasFile = files.length > 0;

  return (
    <div className="space-y-6">
      {!hasFile && (
        <div className="flex flex-col items-center justify-center gap-6 py-8">
          <Avatar className="h-28 w-28 border-4 border-muted">
            <AvatarImage src={userAvatar} className="object-cover" />
            <AvatarFallback className="text-4xl bg-muted">
              <ImageIcon className="h-12 w-12 opacity-50" />
            </AvatarFallback>
          </Avatar>

          <FilePicker
            files={files}
            onFilesChange={setFiles}
            maxFiles={1}
            accept="image/png, image/jpeg, image/webp"
          >
            <FilePickerInput />
            <label className="cursor-pointer">
              <FilePickerButton label="Carregar foto" />
            </label>
          </FilePicker>

          <p className="text-sm text-muted-foreground text-center">
            Suporta JPG, PNG e WEBP até 5MB.
          </p>
        </div>
      )}

      {hasFile && (
        <div className="flex flex-col gap-4">
          <div className="relative h-[300px] w-full bg-black/5 rounded-md overflow-hidden border">
            <Cropper
              image={files[0].url}
              crop={crop}
              zoom={zoom}
              aspect={1}
              onCropChange={setCrop}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
              cropShape="round"
              showGrid={false}
            />
          </div>

          <div className="flex items-center gap-4 px-2">
            <ZoomOut className="h-4 w-4 text-muted-foreground" />
            <Slider
              value={[zoom]}
              min={1}
              max={3}
              step={0.1}
              onValueChange={(val) => setZoom(val[0])}
              className="flex-1 cursor-pointer"
            />
            <ZoomIn className="h-4 w-4 text-muted-foreground" />
          </div>

          <p className="text-xs text-center text-muted-foreground">
            Arraste e zoom para ajustar a miniatura do perfil.
          </p>
        </div>
      )}

      <div className="flex justify-end gap-2 pt-2 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={hasFile ? () => setFiles([]) : onCancel}
          disabled={isSubmitting}
        >
          {hasFile ? 'Trocar Imagem' : 'Cancelar'}
        </Button>

        {hasFile && (
          <Button onClick={handleSave} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Salvar Avatar
          </Button>
        )}
      </div>
    </div>
  );
}
