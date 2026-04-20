import { useState } from "react";
import { Plus } from "lucide-react"; // Opcional, para ícone no botão

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/app/components/ui/sheet";
import { ActionButton } from "@/app/features/permissions/components/action-button";
import { MemberFormProvider } from "../member-form/hook";
import { MemberForm } from "../member-form";


export function AddMember() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <MemberFormProvider
      onOpenChange={setIsOpen}
    >
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <ActionButton
            action="team:manage" 
            className="cursor-pointer items-center"
          >
            <Plus className="h-4 w-4" />
            Adicionar Membro
          </ActionButton>
        </SheetTrigger>
        
        <SheetContent className="w-full sm:max-w-md px-6">
          <SheetHeader className="mb-4">
            <SheetTitle>Adicionar Membro</SheetTitle>
            <SheetDescription>
              Preencha os dados para adicionar um novo membro manualmente à organização.
            </SheetDescription>
          </SheetHeader>
          
          <MemberForm />
          
        </SheetContent>
      </Sheet>
    </MemberFormProvider>
  );
}