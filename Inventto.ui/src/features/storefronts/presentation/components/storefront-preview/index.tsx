import { ImageIcon } from 'lucide-react';

import { cn } from '@/shared/utils';

import type { StorefrontTheme } from '../../../domain/entities';

interface StorefrontPreviewProps {
  name: string;
  slug?: string;
  theme: StorefrontTheme;
  showPrices?: boolean;
}

const PLACEHOLDER_CARDS = [0, 1, 2, 3];

// Somente leitura/derivado — sem fetch próprio. showPrices tem default
// true até a Tab Comportamento (VIT-05) alimentar o valor real.
export function StorefrontPreview({
  name,
  slug,
  theme,
  showPrices = true
}: StorefrontPreviewProps) {
  return (
    <div className="flex flex-col gap-2">
      <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
        Preview ao vivo
      </p>

      <div
        className="overflow-hidden rounded-lg border"
        style={{
          background: theme.colors.background,
          color: theme.colors.text
        }}
      >
        <div className="flex items-center gap-1.5 border-b bg-muted/40 px-3 py-2">
          <span className="size-2 rounded-full bg-muted-foreground/30" />
          <span className="size-2 rounded-full bg-muted-foreground/30" />
          <span className="size-2 rounded-full bg-muted-foreground/30" />
          <span className="ml-2 truncate text-xs text-muted-foreground">
            inventto.app/{slug || 'sua-loja'}
          </span>
        </div>

        <div
          className="flex h-24 items-center justify-center bg-cover bg-center"
          style={
            theme.coverUrl
              ? { backgroundImage: `url(${theme.coverUrl})` }
              : { background: theme.colors.secondary }
          }
        >
          {!theme.coverUrl && (
            <ImageIcon className="size-6 text-background/60" />
          )}
        </div>

        <div className="flex items-center gap-3 px-4 pt-3">
          <div
            className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full border-2"
            style={{ borderColor: theme.colors.background }}
          >
            {theme.logoUrl ? (
              <img
                src={theme.logoUrl}
                alt="Logo da vitrine"
                className="size-full object-cover"
              />
            ) : (
              <span
                className="flex size-full items-center justify-center text-xs font-semibold"
                style={{
                  background: theme.colors.primary,
                  color: theme.colors.background
                }}
              >
                {name.slice(0, 1).toUpperCase() || 'V'}
              </span>
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">
              {name || 'Nome da vitrine'}
            </p>
            <p className="truncate text-xs opacity-70">
              Aberto agora · responde no WhatsApp
            </p>
          </div>
        </div>

        <div
          className={cn(
            'grid gap-3 p-4',
            theme.layout === 'list' ? 'grid-cols-1' : 'grid-cols-2'
          )}
        >
          {PLACEHOLDER_CARDS.map((i) => (
            <div
              key={i}
              className={cn(
                'flex gap-2 overflow-hidden rounded-md border',
                theme.layout === 'list' && 'items-center'
              )}
              style={{ borderColor: `${theme.colors.secondary}40` }}
            >
              <div
                className={cn(
                  'shrink-0 bg-muted/40',
                  theme.layout === 'list' ? 'size-12' : 'aspect-square w-full'
                )}
              />
              {theme.layout === 'list' && (
                <div className="flex flex-1 flex-col gap-1 py-1 pr-2">
                  <span className="h-2 w-3/4 rounded-full bg-muted/60" />
                  {showPrices ? (
                    <span
                      className="h-2 w-1/3 rounded-full"
                      style={{ background: theme.colors.primary }}
                    />
                  ) : (
                    <span
                      className="text-[10px] font-medium"
                      style={{ color: theme.colors.primary }}
                    >
                      Consultar →
                    </span>
                  )}
                </div>
              )}
              {theme.layout === 'grid' && (
                <div className="flex w-full flex-col gap-1 p-2">
                  <span className="h-2 w-3/4 rounded-full bg-muted/60" />
                  {showPrices ? (
                    <span
                      className="h-2 w-1/3 rounded-full"
                      style={{ background: theme.colors.primary }}
                    />
                  ) : (
                    <span
                      className="text-[10px] font-medium"
                      style={{ color: theme.colors.primary }}
                    >
                      Consultar →
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
