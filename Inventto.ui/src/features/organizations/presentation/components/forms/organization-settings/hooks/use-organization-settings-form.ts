import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import { zodResolver } from '@hookform/resolvers/zod';
import { type FieldErrors, useForm, type UseFormReturn } from 'react-hook-form';

import { useUpdateOrganizationMutation } from '@/features/organizations/presentation/hooks/use-mutations';
import { useOrganizationQuery } from '@/features/organizations/presentation/hooks/use-queries';

import {
  defaultSettingsValues,
  type OrganizationSettingsFormData,
  organizationSettingsSchema
} from '../schema';
import { organizationToFormValues } from '../utils/to-form-values';
import { formValuesToUpdateInput } from '../utils/to-update-input';

import { useCepLookup } from './use-cep-lookup';
import { useLogoField } from './use-logo-field';

interface UseOrganizationSettingsFormReturn {
  form: UseFormReturn<OrganizationSettingsFormData>;
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  onDiscard: () => void;
  isLoading: boolean;
  isDirty: boolean;
  showActionBar: boolean;
  organizationName: string;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  logoPreview: string | undefined;
  handleLogoChange: (file: File) => void;
  handleCepBlur: (cep: string) => void;
  cepLoading: boolean;
}

const DANGER_TAB = 'danger';

export const useOrganizationSettingsForm =
  (): UseOrganizationSettingsFormReturn => {
    const { data: organization } = useOrganizationQuery();
    const { mutateAsync: updateOrganization, isPending } =
      useUpdateOrganizationMutation();
    const [searchParams] = useSearchParams();
    // Atalho de pré-requisitos (VIT-02 · RN075: "Defina fuso e horários")
    // linka direto pra aba certa via ?tab= — sem isso, cai na aba padrão.
    const [activeTab, setActiveTab] = useState(
      () => searchParams.get('tab') ?? 'general'
    );

    const form = useForm<OrganizationSettingsFormData>({
      resolver: zodResolver(organizationSettingsSchema),
      defaultValues: defaultSettingsValues
    });

    const { logoPreview, handleLogoChange } = useLogoField(form);
    const { cepLoading, handleCepBlur } = useCepLookup(form);

    useEffect(() => {
      if (!organization) return;

      form.reset(organizationToFormValues(organization));
    }, [organization, form]);

    const onError = (errors: FieldErrors<OrganizationSettingsFormData>) => {
      if (
        errors.name ||
        errors.document ||
        errors.legalName ||
        errors.identity ||
        errors.address
      ) {
        setActiveTab('general');
      } else if (errors.operational) {
        setActiveTab('operational');
      } else if (errors.schedule) {
        setActiveTab('schedule');
      }
    };

    const onSubmit = async (data: OrganizationSettingsFormData) => {
      await updateOrganization(formValuesToUpdateInput(data));
    };

    const isDirty = form.formState.isDirty;

    return {
      form,
      onSubmit: form.handleSubmit(onSubmit, onError),
      onDiscard: () => form.reset(),
      isLoading: isPending,
      isDirty,
      showActionBar: isDirty && activeTab !== DANGER_TAB,
      organizationName: organization?.name ?? '',
      activeTab,
      setActiveTab,
      logoPreview,
      handleLogoChange,
      handleCepBlur,
      cepLoading
    };
  };
