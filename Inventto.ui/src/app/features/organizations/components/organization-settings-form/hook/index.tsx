import { useEffect, useState } from "react";
import { useForm, type FieldErrors, type UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { 
  organizationSettingsSchema, 
  defaultSettingsValues, 
  type OrganizationSettingsFormData 
} from "../schema";

import { useOrganizationQuery } from "@/app/features/organizations/hooks/use-query";
import { OrganizationService } from "@/app/features/organizations/services";

// Importe os tipos do MODELO para fazer o cast correto
import type { OrganizationSettings, DayOfWeek, IBusinessSchedule } from "@/app/features/organizations/types/models";

interface UseOrganizationSettingsFormReturn {
  form: UseFormReturn<OrganizationSettingsFormData>;
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  isLoading: boolean;
  isDirty: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const sanitize = (val?: string) => val?.replace(/\D/g, "") || "";
export const useOrganizationSettingsForm = (): UseOrganizationSettingsFormReturn => {
  const { data: organization, refetch } = useOrganizationQuery();
  const [activeTab, setActiveTab] = useState("general");
  
  const onError = (errors: FieldErrors<OrganizationSettingsFormData>) => {
    if (errors.identity || errors.sales) {
      setActiveTab("general");
    } else if (errors.operational) {
      setActiveTab("operational");
    } else if (errors.schedule) {
      setActiveTab("schedule");
    }
  };
  
  const form = useForm<OrganizationSettingsFormData>({
    resolver: zodResolver(organizationSettingsSchema),
    defaultValues: defaultSettingsValues,
  });

  useEffect(() => {
    if (organization?.settings) {
      // MAPPING INVERSO: Model (openTime) -> Form (open)
      const scheduleForm = Object.entries(organization.settings.schedule).reduce((acc, [key, val]) => {
        acc[key as DayOfWeek] = {
          isOpen: val.isOpen,
          open: val.openTime,   // Converte openTime -> open
          close: val.closeTime  // Converte closeTime -> close
        };
        return acc;
      }, {} as any);

      form.reset({
        identity: {
          displayName: organization.settings.identity?.displayName || organization.name,
          logoUrl: organization.settings.identity?.logoUrl || "",
        },
        operational: {
          timezone: organization.settings.operational?.timezone || defaultSettingsValues.operational.timezone,
          whatsappMain: organization.settings.operational?.whatsappMain || "",
          whatsappSupport: organization.settings.operational?.whatsappSupport || "",
        },
        sales: {
          acceptOrdersOutsideHours: organization.settings.sales?.acceptOrdersOutsideHours ?? false,
        },
        schedule: scheduleForm, // Usa o schedule adaptado
      });
    }
  }, [organization, form]);

  const onSubmit = async (data: OrganizationSettingsFormData) => {
    if (!organization) return;

    // 1. ADAPTER: Form (open) -> Model (openTime)
    // Transforma os dados da UI para o formato estrito do Domínio
    const scheduleModel = Object.entries(data.schedule).reduce((acc, [key, val]) => {
      acc[key as DayOfWeek] = {
        isOpen: val.isOpen,
        openTime: val.open || "",   // Garante string vazia se undefined
        closeTime: val.close || ""
      };
      return acc;
    }, {} as Record<DayOfWeek, IBusinessSchedule>);

    // 2. Monta o objeto final tipado como OrganizationSettings
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
      schedule: scheduleModel // Aqui entra o objeto transformado
    };

    try {
      await OrganizationService.update(organization.id, {
        settings: settingsPayload
      });
      
      toast.success("Configurações atualizadas com sucesso!");
      refetch();
      
    } catch (error) {
      console.error(error);
      toast.error("Erro ao salvar configurações.");
    }
  };

  return {
    form,
    onSubmit: form.handleSubmit(onSubmit, onError),
    isLoading: form.formState.isSubmitting,
    isDirty: form.formState.isDirty,
    activeTab,
    setActiveTab
  };
};