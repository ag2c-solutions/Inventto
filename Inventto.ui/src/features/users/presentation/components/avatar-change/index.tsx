import { useState } from 'react';
import { ImageIcon, ZoomIn, ZoomOut } from 'lucide-react';
import Cropper from 'react-easy-crop';

import {
  FilePicker,
  FilePickerButton,
  FilePickerInput
} from '@/shared/components/common/file-picker';
import { SubmittingButton } from '@/shared/components/common/submitting-button';
import {
  Avatar,
  AvatarFallback,
  AvatarImage
} from '@/shared/components/ui/avatar';
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/shared/components/ui/dialog';
import { Separator } from '@/shared/components/ui/separator';
import { Slider } from '@/shared/components/ui/slider';
import { cn } from '@/shared/utils';

import { useAvatarChange } from './hook';

export function AvatarChange() {
  const [open, setOpen] = useState(false);

  const {
    files,
    userAvatar,
    userInitials,
    crop,
    zoom,
    isSubmitting,
    setFiles,
    setCrop,
    setZoom,
    onCropComplete,
    handleSave,
    reset
  } = useAvatarChange(() => setOpen(false));

  const hasFile = files.length > 0;

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) reset();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start font-normal text-muted-foreground"
        >
          <ImageIcon className="h-4 w-4" />
          <span>Alterar avatar</span>
        </Button>
      </DialogTrigger>

      <DialogContent className={hasFile ? 'sm:max-w-lg' : 'sm:max-w-sm'}>
        <DialogHeader>
          <DialogTitle>Alterar Foto de Perfil</DialogTitle>
          <DialogDescription>
            Faça o upload de uma nova imagem para seu perfil.
          </DialogDescription>
        </DialogHeader>

        {!hasFile && (
          <>
            <div className="flex flex-col items-center justify-center gap-5 py-2">
              <Avatar className="size-24 border-2 border-primary/20">
                <AvatarImage src={userAvatar} className="object-cover" />
                <AvatarFallback className="bg-primary/10 text-2xl font-semibold text-primary">
                  {userInitials}
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

              <p className="text-center text-xs text-muted-foreground">
                Suporta JPG, PNG e WEBP até 5MB.
              </p>
            </div>

            <Separator />

            <DialogFooter>
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={reset}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
              </DialogClose>
            </DialogFooter>
          </>
        )}

        {hasFile && (
          <>
            <div className="flex flex-col gap-4">
              <div
                className={cn(
                  'relative h-[300px] w-full overflow-hidden rounded-md border bg-black/5',
                  isSubmitting && 'pointer-events-none opacity-60'
                )}
              >
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
                  disabled={isSubmitting}
                  className="flex-1 cursor-pointer"
                />
                <ZoomIn className="h-4 w-4 text-muted-foreground" />
              </div>

              <p className="text-center text-xs text-muted-foreground">
                Arraste e zoom para ajustar a miniatura do perfil.
              </p>
            </div>

            <DialogFooter className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={reset}
                disabled={isSubmitting}
              >
                Trocar Imagem
              </Button>

              <SubmittingButton
                type="button"
                className="w-full"
                state={isSubmitting}
                onClick={handleSave}
                label="Salvar Avatar"
                loadingLabel="Salvando…"
              />
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
