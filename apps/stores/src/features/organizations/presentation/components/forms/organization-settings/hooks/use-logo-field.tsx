import { useEffect, useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';

import type { OrganizationSettingsFormData } from '../schema';

interface UseLogoFieldReturn {
  logoPreview: string | undefined;
  handleLogoChange: (file: File) => void;
}

export function useLogoField(
  form: UseFormReturn<OrganizationSettingsFormData>
): UseLogoFieldReturn {
  const logoFile = form.watch('identity.logoFile');
  const [logoPreview, setLogoPreview] = useState<string>();

  useEffect(() => {
    if (!(logoFile instanceof File)) {
      setLogoPreview(undefined);
      return;
    }

    const objectUrl = URL.createObjectURL(logoFile);
    setLogoPreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [logoFile]);

  const handleLogoChange = (file: File) => {
    form.setValue('identity.logoFile', file, { shouldDirty: true });
  };

  return { logoPreview, handleLogoChange };
}
