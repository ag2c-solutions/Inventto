import { Loader2, RotateCcw, Save } from 'lucide-react';

import { Button } from '@/shared/components/ui/button';
import { Form } from '@/shared/components/ui/form';
import { Tabs, TabsContent } from '@/shared/components/ui/tabs';

import { ConfigTabs } from '../../components/config-tabs';
import { StateBadge } from '../../components/storefronts-table/pieces/state-badge';
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

  return (
    <Form {...form}>
      <form
        onSubmit={onSubmit}
        className="mx-auto w-full space-y-6 px-1 py-6 pb-8 md:px-6"
      >
        <header className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
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

          {showActionBar && (
            <div className="flex items-center gap-2 lg:hidden">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={onDiscard}
                disabled={isLoading}
                aria-label="Descartar"
              >
                <RotateCcw className="size-4" />
              </Button>
              <Button
                type="submit"
                size="icon"
                disabled={isLoading}
                aria-label="Salvar alterações"
              >
                {isLoading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Save className="size-4" />
                )}
              </Button>
            </div>
          )}
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
            className="w-full space-y-6 rounded-2xl bg-background/20 py-4"
          >
            <p className="text-sm text-muted-foreground">
              Em breve: identidade visual, logo, capa e layout da vitrine.
            </p>
          </TabsContent>

          <TabsContent
            value="comportamento"
            className="w-full space-y-6 rounded-2xl bg-background/20 py-4"
          >
            <p className="text-sm text-muted-foreground">
              Em breve: exibição de preços, produtos esgotados e destaques.
            </p>
          </TabsContent>
        </Tabs>
      </form>
    </Form>
  );
}
