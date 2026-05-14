import { useState } from 'react';
import {
  Check,
  ChevronsUpDown,
  Eye,
  EyeOff,
  Link as LinkIcon,
  Loader2,
  UserPlus
} from 'lucide-react';

import { Button } from '@/shared/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/shared/components/ui/command';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/shared/components/ui/form';
import { Input } from '@/shared/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/shared/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/shared/components/ui/select';
import { cn } from '@/shared/utils';

import type { IMember } from '../../../domain/entities';

import { useMemberForm } from './hook';

export function MemberForm() {
  const {
    form,
    isLoading,
    onSubmit,
    onCancel,
    isExistingUser,
    candidates,
    onSelectCandidate,
    onHandleClearCandidate
  } = useMemberForm();
  const [openCombobox, setOpenCombobox] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="flex flex-col gap-4 mt-4 h-full"
    >
      <div className="space-y-4 flex-1">
        <div className="space-y-2">
          <FormLabel>Nome do Colaborador</FormLabel>
          <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={openCombobox}
                className="w-full justify-between"
                disabled={isLoading}
              >
                {form.watch('name') || 'Buscar ou digitar nome...'}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[350px] p-0" align="start">
              <Command>
                <CommandInput
                  onValueChange={(e) => form.setValue('name', e)}
                  placeholder="Buscar colaborador..."
                />
                <CommandList>
                  <CommandEmpty>
                    <div className="p-2 text-sm text-muted-foreground">
                      Nenhum usuário encontrado.
                      <Button
                        variant="link"
                        size="sm"
                        className="px-1 h-auto font-normal"
                        onClick={() => {
                          onHandleClearCandidate();
                          setOpenCombobox(false);
                        }}
                      >
                        Criar novo
                      </Button>
                    </div>
                  </CommandEmpty>

                  <CommandGroup heading="Sugestões (Já cadastrados)">
                    {candidates.map((candidate) => (
                      <CommandItem
                        key={candidate.id}
                        value={candidate.name}
                        onSelect={() => {
                          onSelectCandidate(candidate as IMember);
                          setOpenCombobox(false);
                        }}
                      >
                        <Check
                          className={cn(
                            'mr-2 h-4 w-4',
                            form.watch('email') === candidate.email
                              ? 'opacity-100'
                              : 'opacity-0'
                          )}
                        />
                        <div className="flex flex-col">
                          <span>{candidate.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {candidate.email}
                          </span>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          <FormMessage>{form.formState.errors.name?.message}</FormMessage>
        </div>

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>E-mail</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  autoComplete="new-password"
                  disabled={isLoading || isExistingUser}
                  className={
                    isExistingUser ? 'bg-muted text-muted-foreground' : ''
                  }
                />
              </FormControl>
              {isExistingUser && (
                <p className="text-xs text-muted-foreground mt-1">
                  * Este e-mail já está cadastrado no sistema.
                </p>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Função</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
                disabled={isLoading}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="manager">Gerente</SelectItem>
                  <SelectItem value="sales">Vendedor</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {!isExistingUser && (
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Senha Provisória</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      {...field}
                      disabled={isLoading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </div>

      <div className="flex justify-end gap-2 py-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isExistingUser ? (
            <>
              <LinkIcon className="mr-2 h-4 w-4" />
              Vincular Membro
            </>
          ) : (
            <>
              <UserPlus className="mr-2 h-4 w-4" />
              Criar e Adicionar
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
