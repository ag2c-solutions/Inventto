import { useState } from 'react';
import { UserPlus } from 'lucide-react';

import { ActionButton } from '@/features/permissions';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from '@/shared/components/ui/sheet';
import { useIsMobile } from '@/shared/hooks/use-is-mobile';

import { MemberForm } from '../member-form';
import { MemberFormProvider } from '../member-form/hook';

interface AddMemberProps {
  iconOnly?: boolean;
}

export function AddMember({ iconOnly = false }: AddMemberProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();

  return (
    <MemberFormProvider onOpenChange={setIsOpen}>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <ActionButton
            action="team:manage"
            aria-label="Adicionar Membro"
            className={
              iconOnly
                ? 'cursor-pointer items-center size-9 p-0'
                : 'cursor-pointer items-center'
            }
          >
            <UserPlus className="h-4 w-4" />
            {!iconOnly && 'Adicionar Membro'}
          </ActionButton>
        </SheetTrigger>

        <SheetContent
          side={isMobile ? 'bottom' : 'right'}
          className={
            isMobile
              ? 'h-auto max-h-[90vh] w-full overflow-y-auto rounded-t-2xl px-6'
              : 'w-full sm:max-w-md px-6'
          }
        >
          <SheetHeader className="mb-4">
            <SheetTitle>Adicionar membro</SheetTitle>
            <SheetDescription>
              Preencha os dados do novo integrante da equipe.
            </SheetDescription>
          </SheetHeader>

          <MemberForm />
        </SheetContent>
      </Sheet>
    </MemberFormProvider>
  );
}
