import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, type UseFormReturn } from 'react-hook-form';

import {
  type StorefrontConfigFormValues,
  storefrontConfigSchema
} from '../../../../domain/validators';
import { useSaveStorefrontMutation } from '../../../hooks/use-mutations';
import { useStorefrontQuery } from '../../../hooks/use-queries';

interface StorefrontParams {
  [key: string]: string | undefined;
  storefrontId: string;
}

interface UseStorefrontConfigFormReturn {
  form: UseFormReturn<StorefrontConfigFormValues>;
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

const DEFAULT_VALUES: StorefrontConfigFormValues = {
  name: '',
  catalogId: undefined,
  slug: '',
  whatsapp: '',
  instagram: '',
  facebook: '',
  website: '',
  theme: {
    colors: {
      primary: '#3A3631',
      background: '#F7F5F2',
      secondary: '#8B857D',
      text: '#2C2A28'
    },
    logoUrl: undefined,
    coverUrl: undefined,
    layout: 'grid',
    cardStyle: 'minimal-large-image'
  }
};

export function useStorefrontConfigForm(): UseStorefrontConfigFormReturn {
  const { storefrontId } = useParams<StorefrontParams>();
  const [activeTab, setActiveTab] = useState('geral');

  const { data: storefront } = useStorefrontQuery(storefrontId);
  const { mutateAsync: saveStorefront, isPending } =
    useSaveStorefrontMutation();

  const form = useForm<StorefrontConfigFormValues>({
    resolver: zodResolver(storefrontConfigSchema),
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
      website: storefront.website ?? '',
      theme: {
        colors: storefront.theme.colors,
        logoUrl: storefront.theme.logoUrl,
        coverUrl: storefront.theme.coverUrl,
        layout: storefront.theme.layout,
        cardStyle: storefront.theme.cardStyle
      }
    });
  }, [storefront, form]);

  // Navegação para /storefronts/:id ao criar já é feita pelo
  // useSaveStorefrontMutation (mesma convenção de useCreateCatalogMutation).
  const onSubmit = async (values: StorefrontConfigFormValues) => {
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
