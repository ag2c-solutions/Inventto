import { createContext, type ReactNode, useContext, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, useForm, type UseFormReturn } from 'react-hook-form';

import type { IMember } from '../../../../domain/entities';
import {
  useCreateMemberMutation,
  useReplicateMemberMutation
} from '../../../hooks/use-mutations';
import { useCandidatesQuery } from '../../../hooks/use-queries';
import { type MemberFormData, memberFormSchema } from '../schema';

type TMemberFormContext = {
  form: UseFormReturn<MemberFormData>;
  candidates: Partial<IMember>[];
  isLoading: boolean;
  isExistingUser: boolean;
  onSelectCandidate: (candidate: IMember) => void;
  onHandleClearCandidate: () => void;
  onSubmit: () => void;
  onCancel: () => void;
};

const MemberFormContext = createContext<TMemberFormContext | null>(null);

export type MemberFormProviderProps = {
  children: ReactNode;
  onSuccess?: () => void;
  onOpenChange: (open: boolean) => void;
};

export function MemberFormProvider({
  children,
  onSuccess,
  onOpenChange
}: MemberFormProviderProps) {
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(
    null
  );
  const { data: candidates = [] } = useCandidatesQuery();
  const { mutateAsync: replicateMember, isPending: isReplicating } =
    useReplicateMemberMutation();
  const { mutateAsync: createMember, isPending: isCreating } =
    useCreateMemberMutation();
  const isLoading = isReplicating || isCreating;

  const form = useForm<MemberFormData>({
    resolver: zodResolver(memberFormSchema),
    defaultValues: {
      name: '',
      email: '',
      role: 'sales',
      password: ''
    }
  });

  const handleSelectCandidate = (candidate: IMember) => {
    setSelectedCandidateId(candidate.id);

    form.setValue('name', candidate.name);
    form.setValue('email', candidate.email);
    form.setValue('password', '********');
    form.clearErrors();
  };

  const handleClearCandidate = () => {
    setSelectedCandidateId(null);
  };

  const handleSubmit = async (data: MemberFormData) => {
    if (selectedCandidateId) {
      await replicateMember({ userId: selectedCandidateId, role: data.role });
    } else {
      await createMember({
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role
      });
    }

    onSuccess?.();
    onOpenChange(false);
    form.reset();
    setSelectedCandidateId(null);
  };

  const contextValue: TMemberFormContext = {
    form,
    candidates,
    isLoading,
    isExistingUser: !!selectedCandidateId,
    onSelectCandidate: handleSelectCandidate,
    onHandleClearCandidate: handleClearCandidate,
    onSubmit: form.handleSubmit(handleSubmit),
    onCancel: () => {
      handleClearCandidate();
      onOpenChange(false);
    }
  };

  return (
    <MemberFormContext.Provider value={contextValue}>
      <FormProvider {...form}>{children}</FormProvider>
    </MemberFormContext.Provider>
  );
}

export const useMemberForm = () => {
  const context = useContext(MemberFormContext);

  if (!context)
    throw new Error(
      'useMemberForm deve ser usado dentro de um MemberFormProvider'
    );

  return context;
};
