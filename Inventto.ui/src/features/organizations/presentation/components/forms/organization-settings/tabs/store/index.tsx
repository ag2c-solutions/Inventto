import { Loader2 } from 'lucide-react';
import type { UseFormReturn } from 'react-hook-form';

import {
  Avatar,
  AvatarFallback,
  AvatarImage
} from '@/shared/components/ui/avatar';
import { Card, CardContent } from '@/shared/components/ui/card';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/shared/components/ui/form';
import { Input } from '@/shared/components/ui/input';
import { cn } from '@/shared/utils';
import { formatDocument, normalizeDocument } from '@/shared/utils';

import { LogoChange } from '../../../../actions/logo-change';
import type { OrganizationSettingsFormData } from '../../schema';

interface StoreTabContentProps {
  form: UseFormReturn<OrganizationSettingsFormData>;
  isSaving: boolean;
  logoPreview: string | undefined;
  handleLogoChange: (file: File) => void;
  handleCepBlur: (cep: string) => void;
  cepLoading: boolean;
}

export const StoreTabContent = ({
  form,
  isSaving,
  logoPreview,
  handleLogoChange,
  handleCepBlur,
  cepLoading
}: StoreTabContentProps) => {
  const logoUrl = form.watch('identity.logoUrl');
  const currentLogoSrc = logoPreview ?? logoUrl;

  return (
    <div className="space-y-6 text-muted-foreground">
      <section className="space-y-2">
        <span className="text-sm font-medium text-foreground">
          Logo da loja
        </span>
        <div className="flex items-center pt-2 gap-4">
          <Avatar className="size-20 shrink-0">
            {currentLogoSrc ? (
              <AvatarImage
                src={currentLogoSrc}
                alt="Logo da loja"
                className="object-cover"
              />
            ) : null}
            <AvatarFallback className="bg-sidebar/60">
              <span className="text-xs text-muted-foreground">Logo</span>
            </AvatarFallback>
          </Avatar>

          <div className="space-y-1">
            <LogoChange
              currentLogoSrc={currentLogoSrc}
              disabled={isSaving}
              onLogoChange={handleLogoChange}
            />
            <p className="text-xs text-muted-foreground">
              PNG, JPG ou WEBP até 5MB.
            </p>
          </div>
        </div>
      </section>

      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nome fantasia</FormLabel>
            <FormControl>
              <Input placeholder="Ex: Boutique da Ana" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <section className="space-y-3 flex flex-col gap-3.5">
        <span className="text-sm font-medium text-foreground">
          Identidade fiscal
        </span>
        <Card className="bg-sidebar/50 pb-10">
          <CardContent>
            <div
              className={cn(
                'grid gap-6',
                'grid-cols-1 md:grid-cols-2 md:gap-12'
              )}
            >
              <FormField
                control={form.control}
                name="document"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-muted-foreground">
                      Documento
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="CPF ou CNPJ"
                        className="font-mono"
                        value={formatDocument(field.value || '')}
                        onChange={(e) =>
                          field.onChange(normalizeDocument(e.target.value))
                        }
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="legalName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-muted-foreground">
                      Razão social
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Razão social" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-3 flex flex-col gap-3.5">
        <span className="text-sm font-medium text-foreground">Endereço</span>

        <div className="grid grid-cols-6 gap-3 text">
          <FormField
            control={form.control}
            name="address.zip"
            render={({ field }) => (
              <FormItem className="col-span-6 md:col-span-2">
                <FormLabel>CEP</FormLabel>
                <div className="relative">
                  <FormControl>
                    <Input
                      placeholder="00000-000"
                      className="font-mono pr-8"
                      maxLength={9}
                      {...field}
                      onBlur={(e) => {
                        field.onBlur();
                        handleCepBlur(e.target.value);
                      }}
                    />
                  </FormControl>
                  {cepLoading && (
                    <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 size-4 animate-spin text-muted-foreground pointer-events-none" />
                  )}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address.street"
            render={({ field }) => (
              <FormItem className="col-span-6 md:col-span-4">
                <FormLabel>Logradouro</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Preencha o endereço"
                    disabled
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address.number"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Número</FormLabel>
                <FormControl>
                  <Input placeholder="—" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address.complement"
            render={({ field }) => (
              <FormItem className="col-span-4">
                <FormLabel>Complemento</FormLabel>
                <FormControl>
                  <Input placeholder="Opcional" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address.district"
            render={({ field }) => (
              <FormItem className="col-span-3">
                <FormLabel>Bairro</FormLabel>
                <FormControl>
                  <Input placeholder="—" disabled {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address.city"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Cidade</FormLabel>
                <FormControl>
                  <Input placeholder="—" disabled {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address.state"
            render={({ field }) => (
              <FormItem className="col-span-1">
                <FormLabel>UF</FormLabel>
                <FormControl>
                  <Input
                    placeholder="—"
                    maxLength={2}
                    className="uppercase"
                    disabled
                    {...field}
                    onChange={(e) =>
                      field.onChange(e.target.value.toUpperCase())
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </section>
    </div>
  );
};
