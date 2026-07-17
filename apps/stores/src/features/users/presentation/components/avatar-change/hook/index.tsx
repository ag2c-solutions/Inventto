import { useCallback, useState } from 'react';

import type { FileWithPreview } from '@/shared/components/common/file-picker/types';

import type { PixelCrop } from '../../../../domain/entities';
import { getUserNameInitials } from '../../../../domain/utils/get-user-name-initials';
import { useUpdateAvatarMutation } from '../../../hooks/use-mutation';
import { useUser } from '../../../hooks/use-user';
import { getCroppedImg } from '../../../utils/get-cropped-img';

export function useAvatarChange(onSaved?: () => void) {
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

  const handleSave = async () => {
    if (!user || files.length === 0 || !croppedAreaPixels) return;

    const croppedFile = await getCroppedImg(files[0].url, croppedAreaPixels);

    if (!croppedFile) return;

    mutate(
      {
        userId: user.id,
        file: croppedFile
      },
      {
        onSuccess: () => {
          reset();
          onSaved?.();
        }
      }
    );
  };

  return {
    files,
    userAvatar: user?.avatarUrl ?? undefined,
    userInitials: user?.fullName ? getUserNameInitials(user.fullName) : '',
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
