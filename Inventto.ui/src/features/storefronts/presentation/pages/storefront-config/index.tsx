import { Loader2, Save } from 'lucide-react';

import { Button } from '@/shared/components/ui/button';
import { Form } from '@/shared/components/ui/form';
import { Tabs, TabsContent } from '@/shared/components/ui/tabs';
import { cn } from '@/shared/utils';

import { BackToStorefrontsLink } from '../../components/actions/back-to-storefronts';
import { ConfigTabs } from '../../components/config-tabs';
import { StorefrontPreview } from '../../components/storefront-preview';
import { StateBadge } from '../../components/storefronts-table/pieces/state-badge';
import { TabAppearance } from '../../components/tab-appearance';
import { useThemeImageField } from '../../components/tab-appearance/hooks/use-theme-image-field';
import { TabBehavior } from '../../components/tab-behavior';
import { TabGeneral } from '../../components/tab-general';

import { useStorefrontConfigForm } from './hooks/use-storefront-config-form';

export function StorefrontConfigPage() {
  const {
    form,
    storefrontId,
    isCreate,
    storefrontName,
    storefrontState,
    publicUrl,
    onSubmit,
    onDiscard,
    isLoading,
    showActionBar,
    activeTab,
    setActiveTab
  } = useStorefrontConfigForm();

  const previewName = form.watch('name');
  const previewSlug = form.watch('slug');
  const previewTheme = form.watch('theme');
  const previewShowPrices = form.watch('behavior.showPrices');
  const logo = useThemeImageField(form, 'logoFile', 'logoUrl');
  const cover = useThemeImageField(form, 'coverFile', 'coverUrl');

  return (
    <Form {...form}>
      <form
        onSubmit={onSubmit}
        className={cn(
          'mx-auto w-full space-y-6 px-1 py-2 md:px-6',
          showActionBar ? 'pb-24 lg:pb-8' : 'pb-8'
        )}
      >
        <header className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <BackToStorefrontsLink />
            {isCreate ? (
              <h1 className="text-2xl leading-tight font-semibold text-foreground">
                Nova vitrine
              </h1>
            ) : (
              <div className="flex items-center gap-2">
                <h1 className="text-2xl leading-tight font-semibold text-foreground">
                  {storefrontName}
                </h1>
                {storefrontState && <StateBadge state={storefrontState} />}
              </div>
            )}
            <p className="text-sm text-muted-foreground">
              {isCreate
                ? 'Configure a vitrine e publique quando estiver pronta.'
                : (publicUrl ?? 'Defina um endereço público na aba Geral.')}
            </p>
          </div>
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <ConfigTabs />

            {showActionBar && (
              <div className="hidden items-center gap-2 lg:flex">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onDiscard}
                  disabled={isLoading}
                >
                  Descartar
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Salvando…
                    </>
                  ) : (
                    <>
                      <Save className="size-4" />
                      Salvar alterações
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>

          <TabsContent
            value="geral"
            className="w-full space-y-6 rounded-2xl bg-background/20 py-4"
          >
            <TabGeneral
              form={form}
              storefrontId={storefrontId}
              isSaving={isLoading}
            />
          </TabsContent>

          <TabsContent
            value="aparencia"
            className="w-full rounded-2xl bg-background/20 py-4"
          >
            <div className="grid min-w-0 gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
              <TabAppearance form={form} isSaving={isLoading} />
              <StorefrontPreview
                name={previewName}
                slug={previewSlug}
                theme={{
                  colors: previewTheme.colors,
                  logoUrl: logo.preview,
                  coverUrl: cover.preview,
                  layout: previewTheme.layout,
                  cardStyle: previewTheme.cardStyle
                }}
                showPrices={previewShowPrices}
              />
            </div>
          </TabsContent>

          <TabsContent
            value="comportamento"
            className="w-full rounded-2xl bg-background/20 py-4"
          >
            <TabBehavior
              form={form}
              storefrontId={storefrontId}
              isSaving={isLoading}
            />
          </TabsContent>
        </Tabs>

        {showActionBar && (
          <div className="fixed inset-x-0 bottom-0 z-10 flex items-center gap-2 border-t bg-background p-3 lg:hidden">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onDiscard}
              disabled={isLoading}
            >
              Descartar
            </Button>
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Salvando…
                </>
              ) : (
                <>
                  <Save className="size-4" />
                  Salvar alterações
                </>
              )}
            </Button>
          </div>
        )}
      </form>
    </Form>
  );
}
