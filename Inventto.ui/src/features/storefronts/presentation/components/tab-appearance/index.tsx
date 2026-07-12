import type { UseFormReturn } from 'react-hook-form';

import {
  Avatar,
  AvatarFallback,
  AvatarImage
} from '@/shared/components/ui/avatar';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/shared/components/ui/form';

import { LogoChange } from '@/features/organizations';

import type { StorefrontConfigFormValues } from '../../../domain/validators';
import { CardStyleSelect } from '../card-style-select';
import { ColorField } from '../color-field';
import { CoverUploader } from '../cover-uploader';
import { LayoutSegmented } from '../layout-segmented';

import { useThemeImageField } from './hooks/use-theme-image-field';

interface TabAppearanceProps {
  form: UseFormReturn<StorefrontConfigFormValues>;
  isSaving: boolean;
}

export function TabAppearance({ form, isSaving }: TabAppearanceProps) {
  const logo = useThemeImageField(form, 'logoFile', 'logoUrl');
  const cover = useThemeImageField(form, 'coverFile', 'coverUrl');

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <h3 className="text-sm font-medium text-foreground">
          Identidade visual
        </h3>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <ColorField
            control={form.control}
            name="theme.colors.primary"
            label="Primária"
            disabled={isSaving}
          />
          <ColorField
            control={form.control}
            name="theme.colors.background"
            label="Fundo"
            disabled={isSaving}
          />
          <ColorField
            control={form.control}
            name="theme.colors.secondary"
            label="Secundária"
            disabled={isSaving}
          />
          <ColorField
            control={form.control}
            name="theme.colors.text"
            label="Texto"
            disabled={isSaving}
          />
        </div>

        <FormItem>
          <FormLabel>Logo</FormLabel>
          <div className="flex items-center gap-4">
            <Avatar className="size-20 shrink-0">
              {logo.preview ? (
                <AvatarImage src={logo.preview} className="object-cover" />
              ) : null}
              <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                Logo
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <LogoChange
                currentLogoSrc={logo.preview}
                disabled={isSaving}
                onLogoChange={logo.handleChange}
              />
              <p className="text-xs text-muted-foreground">
                PNG, JPG ou WEBP até 5MB.
              </p>
            </div>
          </div>
        </FormItem>

        <FormItem>
          <FormLabel>Imagem de capa</FormLabel>
          <CoverUploader
            coverSrc={cover.preview}
            disabled={isSaving}
            onCoverChange={cover.handleChange}
          />
        </FormItem>
      </section>

      <section className="space-y-4">
        <h3 className="text-sm font-medium text-foreground">
          Layout da vitrine
        </h3>

        <FormField
          control={form.control}
          name="theme.layout"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Disposição dos produtos</FormLabel>
              <FormControl>
                <LayoutSegmented
                  value={field.value}
                  onChange={field.onChange}
                  disabled={isSaving}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="theme.cardStyle"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Estilo de card</FormLabel>
              <FormControl>
                <CardStyleSelect
                  value={field.value}
                  onChange={field.onChange}
                  disabled={isSaving}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </section>
    </div>
  );
}
