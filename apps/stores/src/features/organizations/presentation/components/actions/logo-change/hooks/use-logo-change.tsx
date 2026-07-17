import { useCallback, useState } from 'react';

import type { FileWithPreview } from '@/shared/components/common/file-picker/types';

import { getCroppedImg } from '../../../../utils/get-cropped-img';

interface PixelCrop {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface UseLogoChangeProps {
  onLogoChange: (file: File) => void | Promise<void>;
  onSaved?: () => void;
}

export function useLogoChange({ onLogoChange, onSaved }: UseLogoChangeProps) {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<PixelCrop | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onCropComplete = useCallback(
    (_croppedArea: unknown, pixels: PixelCrop) => {
      setCroppedAreaPixels(pixels);
    },
    []
  );

  const reset = () => {
    setFiles([]);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
  };

  const handleSave = async () => {
    if (files.length === 0 || !croppedAreaPixels) return;

    setIsSubmitting(true);
    const croppedFile = await getCroppedImg(files[0].url, croppedAreaPixels);
    setIsSubmitting(false);

    if (!croppedFile) return;

    void onLogoChange(croppedFile);
    reset();
    onSaved?.();
  };

  return {
    files,
    crop,
    zoom,
    isSubmitting,
    setFiles,
    setCrop,
    setZoom,
    onCropComplete,
    handleSave,
    reset
  };
}
