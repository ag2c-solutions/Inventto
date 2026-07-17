import { useEffect, useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';

import type { StorefrontConfigFormValues } from '../../../../domain/validators';

interface UseThemeImageFieldReturn {
  preview: string | undefined;
  handleChange: (file: File) => void;
}

// Mesmo padrão de use-logo-field (organizations/ORG-02): guarda o File cru
// no form até o submit — o upload de fato acontece em StorefrontService.save.
export function useThemeImageField(
  form: UseFormReturn<StorefrontConfigFormValues>,
  field: 'logoFile' | 'coverFile',
  urlField: 'logoUrl' | 'coverUrl'
): UseThemeImageFieldReturn {
  const file = form.watch(`theme.${field}`);
  const url = form.watch(`theme.${urlField}`);
  const [preview, setPreview] = useState<string | undefined>();

  useEffect(() => {
    if (!(file instanceof File)) {
      setPreview(undefined);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  const handleChange = (next: File) => {
    form.setValue(`theme.${field}`, next, { shouldDirty: true });
  };

  return { preview: preview ?? url, handleChange };
}
