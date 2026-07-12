import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, type UseFormReturn } from 'react-hook-form';

import {
  type StorefrontGeneralFormValues,
  storefrontGeneralSchema
} from '../../../../domain/validators';
import { useSaveStorefrontMutation } from '../../../hooks/use-mutations';
import { useStorefrontQuery } from '../../../hooks/use-queries';

interface StorefrontParams {
  [key: string]: string | undefined;
  storefrontId: string;
}

interface UseStorefrontConfigFormReturn {
  form: UseFormReturn<StorefrontGeneralFormValues>;
  storefrontId?: string;
  isCreate: boolean;
  storefrontName: string;
  storefrontState: 'live' | 'inactive' | undefined;
  publicUrl: string | undefined;
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  onDiscard: () => void;
  isLoading: boolean;
  showActionBar: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const DEFAULT_VALUES: StorefrontGeneralFormValues = {
  name: '',
  catalogId: undefined,
  slug: '',
  whatsapp: '',
  instagram: '',
  facebook: '',
  website: ''
};

export function useStorefrontConfigForm(): UseStorefrontConfigFormReturn {
  const { storefrontId } = useParams<StorefrontParams>();
  const [activeTab, setActiveTab] = useState('geral');

  const { data: storefront } = useStorefrontQuery(storefrontId);
  const { mutateAsync: saveStorefront, isPending } =
    useSaveStorefrontMutation();

  const form = useForm<StorefrontGeneralFormValues>({
    resolver: zodResolver(storefrontGeneralSchema),
    defaultValues: DEFAULT_VALUES
  });

  useEffect(() => {
    if (!storefront) return;

    form.reset({
      name: storefront.name,
      catalogId: storefront.catalogId,
      slug: storefront.slug ?? '',
      whatsapp: storefront.whatsapp ?? '',
      instagram: storefront.instagram ?? '',
      facebook: storefront.facebook ?? '',
      website: storefront.website ?? ''
    });
  }, [storefront, form]);

  // Navegação para /storefronts/:id ao criar já é feita pelo
  // useSaveStorefrontMutation (mesma convenção de useCreateCatalogMutation).
  const onSubmit = async (values: StorefrontGeneralFormValues) => {
    await saveStorefront({ id: storefrontId, values });
  };

  return {
    form,
    storefrontId,
    isCreate: !storefrontId,
    storefrontName: storefront?.name ?? '',
    storefrontState: storefront?.state,
    publicUrl: storefront?.publicUrl,
    onSubmit: form.handleSubmit(onSubmit),
    onDiscard: () => form.reset(),
    isLoading: isPending,
    showActionBar: form.formState.isDirty,
    activeTab,
    setActiveTab
  };
}
