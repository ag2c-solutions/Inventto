import { useState } from 'react';
import { Eye, EyeOff, Loader2, Lock, UserCheck, X } from 'lucide-react';

import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar';
import { Button } from '@/shared/components/ui/button';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/shared/components/ui/form';
import { Input } from '@/shared/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/shared/components/ui/select';
import { cn } from '@/shared/utils';

import type { IMember } from '../../../../domain/entities';

import { useMemberForm } from './hooks/use-member-form';

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

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
  const [showPassword, setShowPassword] = useState(false);
  const [isNameFocused, setIsNameFocused] = useState(false);

  const nameValue = form.watch('name');

  const suggestions = candidates.filter(
    (candidate) =>
      candidate.name &&
      nameValue.trim().length > 0 &&
      candidate.name.toLowerCase().includes(nameValue.trim().toLowerCase())
  );

  const showSuggestions =
    !isExistingUser && isNameFocused && suggestions.length > 0;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="flex flex-col gap-4 mt-4 h-full"
    >
      <div className="space-y-4 flex-1">
        {isExistingUser && (
          <div className="flex gap-2 rounded-md bg-sidebar p-3 text-sm text-sidebar-foreground">
            <UserCheck className="mt-0.5 h-4 w-4 shrink-0" />
            <p>
              Membro existente de outra unidade. Ele entra{' '}
              <strong className="font-semibold text-foreground">ativo</strong>,
              sem precisar de primeiro acesso.
            </p>
          </div>
        )}

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome completo</FormLabel>
              <div className="relative">
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Ex: Ana Carvalho"
                    autoComplete="new-password"
                    readOnly={isExistingUser}
                    disabled={isLoading}
                    className={cn(isExistingUser && 'pr-10')}
                    onFocus={() => setIsNameFocused(true)}
                    onBlur={() => {
                      setTimeout(() => setIsNameFocused(false), 150);
                    }}
                  />
                </FormControl>

                {isExistingUser && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    aria-label="Limpar seleção"
                    className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 p-0"
                    onClick={onHandleClearCandidate}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}

                {showSuggestions && (
                  <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-md border bg-popover shadow-md">
                    <p className="px-3 pt-2 pb-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                      Já está no seu negócio
                    </p>
                    <ul>
                      {suggestions.map((candidate) => (
                        <li key={candidate.id}>
                          <button
                            type="button"
                            className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-accent"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => {
                              onSelectCandidate(candidate as IMember);
                              setIsNameFocused(false);
                            }}
                          >
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="text-xs">
                                {getInitials(candidate.name ?? '')}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex min-w-0 flex-col">
                              <span className="truncate text-sm font-medium">
                                {candidate.name}
                              </span>
                              <span className="truncate text-xs text-muted-foreground">
                                {candidate.email}
                              </span>
                            </div>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>E-mail</FormLabel>
              <div className="relative">
                <FormControl>
                  <Input
                    {...field}
                    type="email"
                    placeholder="email@exemplo.com"
                    autoComplete="off"
                    readOnly={isExistingUser}
                    disabled={isLoading}
                    className={cn(
                      isExistingUser &&
                        'pr-10 bg-muted/60 text-muted-foreground'
                    )}
                  />
                </FormControl>
                {isExistingUser && (
                  <Lock className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                )}
              </div>
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
                    <SelectValue placeholder="Selecione a função" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="manager">Gerente</SelectItem>
                  <SelectItem value="sales">Vendedor</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Gerente ou Vendedor. O papel Dono não é atribuível.
              </p>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Senha provisória — exigida só no fluxo de novo membro. */}
        {isExistingUser ? (
          <FormItem>
            <FormLabel>Senha provisória</FormLabel>
            <div className="relative">
              <Input
                placeholder="Não necessária"
                disabled
                readOnly
                className="pr-10 bg-muted/60 text-muted-foreground"
              />
              <Lock className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground">
              Senha não necessária — este usuário já tem acesso ativo.
            </p>
          </FormItem>
        ) : (
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Senha provisória</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      placeholder="Defina uma senha provisória"
                      {...field}
                      disabled={isLoading}
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      aria-label={
                        showPassword ? 'Ocultar senha' : 'Mostrar senha'
                      }
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
                <p className="text-xs text-muted-foreground">
                  O membro troca a senha no primeiro acesso.
                </p>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </div>

      <div className="flex justify-end gap-2 py-4">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isLoading
            ? 'Enviando...'
            : isExistingUser
              ? 'Replicar membro'
              : 'Enviar convite'}
        </Button>
      </div>
    </form>
  );
}
