import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { type FieldErrors, useForm, type UseFormReturn } from 'react-hook-form';

import type {
  DayOfWeek,
  IBusinessSchedule,
  OrganizationSettings
} from '../../../../domain/entities';
import { useUpdateOrganizationMutation } from '../../../hooks/use-mutations';
import { useOrganizationQuery } from '../../../hooks/use-queries';
import {
  defaultSettingsValues,
  type OrganizationSettingsFormData,
  organizationSettingsSchema
} from '../schema';

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
}

// RN025 — edição confirmada: a barra de ações só aparece quando há alterações
// pendentes e nunca na aba Danger Zone (ações de ciclo de vida, não edição).
const DANGER_TAB = 'danger';

const sanitize = (val?: string) => val?.replace(/\D/g, '') || '';

export const useOrganizationSettingsForm =
  (): UseOrganizationSettingsFormReturn => {
    const { data: organization } = useOrganizationQuery();
    const { mutateAsync: updateOrganization, isPending } =
      useUpdateOrganizationMutation();
    const [activeTab, setActiveTab] = useState('general');

    const onError = (errors: FieldErrors<OrganizationSettingsFormData>) => {
      if (errors.identity || errors.sales) {
        setActiveTab('general');
      } else if (errors.operational) {
        setActiveTab('operational');
      } else if (errors.schedule) {
        setActiveTab('schedule');
      }
    };

    const form = useForm<OrganizationSettingsFormData>({
      resolver: zodResolver(organizationSettingsSchema),
      defaultValues: defaultSettingsValues
    });

    useEffect(() => {
      if (organization?.settings) {
        const scheduleForm = Object.entries(
          organization.settings.schedule
        ).reduce(
          (acc, [key, val]) => {
            acc[key as DayOfWeek] = {
              isOpen: val.isOpen,
              open: val.openTime,
              close: val.closeTime
            };
            return acc;
          },
          {} as Record<
            DayOfWeek,
            { isOpen: boolean; open: string; close: string }
          >
        );

        form.reset({
          identity: {
            displayName:
              organization.settings.identity?.displayName || organization.name,
            logoUrl: organization.settings.identity?.logoUrl || ''
          },
          operational: {
            timezone:
              organization.settings.operational?.timezone ||
              defaultSettingsValues.operational.timezone,
            whatsappMain: organization.settings.operational?.whatsappMain || '',
            whatsappSupport:
              organization.settings.operational?.whatsappSupport || ''
          },
          sales: {
            acceptOrdersOutsideHours:
              organization.settings.sales?.acceptOrdersOutsideHours ?? false
          },
          schedule: scheduleForm
        });
      }
    }, [organization, form]);

    const onSubmit = async (data: OrganizationSettingsFormData) => {
      const scheduleModel = Object.entries(data.schedule).reduce(
        (acc, [key, val]) => {
          acc[key as DayOfWeek] = {
            isOpen: val.isOpen,
            openTime: val.open || '',
            closeTime: val.close || ''
          };
          return acc;
        },
        {} as Record<DayOfWeek, IBusinessSchedule>
      );

      const settingsPayload: OrganizationSettings = {
        identity: data.identity,
        operational: {
          timezone: data.operational.timezone,
          whatsappMain: sanitize(data.operational.whatsappMain),
          whatsappSupport: data.operational.whatsappSupport
            ? sanitize(data.operational.whatsappSupport)
            : undefined
        },
        sales: data.sales,
        schedule: scheduleModel
      };

      await updateOrganization(settingsPayload);
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
      setActiveTab
    };
  };
