import { useCallback, useState } from 'react';

import type { FileWithPreview } from '@/shared/components/common/file-picker/types';
import type { PixelCrop } from '../../../utils/pixel-crop.types';

import { useUpdateAvatarMutation } from '../../../hooks/use-mutation';
import { useUser } from '../../../hooks/use-user';

type UseAvatarChangeProps = {
  onSuccess?: () => void;
};

export function useAvatarChange({ onSuccess }: UseAvatarChangeProps) {
  const { user } = useUser();
  const { mutate, isPending } = useUpdateAvatarMutation();
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<PixelCrop | null>(
    null
  );

  const onCropComplete = useCallback(
    (_croppedArea: unknown, croppedAreaPixels: PixelCrop) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const reset = () => {
    setFiles([]);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  };

  const handleSave = () => {
    if (!user || files.length === 0 || !croppedAreaPixels) return;

    mutate(
      {
        userId: user.id,
        imageSrc: files[0].url,
        pixelCrop: croppedAreaPixels
      },
      {
        onSuccess: () => {
          reset();
          onSuccess?.();
        }
      }
    );
  };

  return {
    files,
    userAvatar: user?.avatarUrl ?? undefined,
    crop,
    zoom,
    isSubmitting: isPending,
    setFiles,
    setCrop,
    setZoom,
    onCropComplete,
    handleSave,
    reset
  };
}
