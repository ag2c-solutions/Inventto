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
  const isList = theme.layout === 'list';

  const withAlpha = (hex: string, percent: number): string =>
    `color-mix(in srgb, ${hex} ${percent}%, transparent)`;

  return (
    <div className="flex flex-col gap-2">
      <p className="flex items-center gap-1.5 text-sm font-medium uppercase tracking-wide text-muted-foreground">
        <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
        Preview ao vivo
      </p>

      <div
        className="overflow-hidden rounded-xl border"
        style={{
          background: theme.colors.background,
          color: theme.colors.text
        }}
      >
        {/* Barra do browser */}
        <div
          className="flex items-center gap-1.5 border-b px-3 py-2"
          style={{ background: withAlpha(theme.colors.secondary, 15) }}
        >
          <span
            className="size-2 rounded-full"
            style={{ background: withAlpha(theme.colors.text, 20) }}
          />
          <span
            className="size-2 rounded-full"
            style={{ background: withAlpha(theme.colors.text, 20) }}
          />
          <span
            className="size-2 rounded-full"
            style={{ background: withAlpha(theme.colors.text, 20) }}
          />
          <span
            className="ml-2 truncate text-[11px]"
            style={{ color: withAlpha(theme.colors.text, 50) }}
          >
            inventto.app/{slug || 'sua-loja'}
          </span>
        </div>

        {/* Capa */}
        <div
          className="h-32 bg-cover bg-center"
          style={
            theme.coverUrl
              ? { backgroundImage: `url(${theme.coverUrl})` }
              : { background: withAlpha(theme.colors.secondary, 30) }
          }
        />

        {/* Header: logo sobreposto na borda da capa + nome abaixo */}
        <div className="flex flex-col gap-0.5 px-4 pb-2">
          <div
            className="-mt-7 mb-1 flex size-15 shrink-0 items-center justify-center overflow-hidden rounded-full border-2"
            style={{
              borderColor: theme.colors.background,
              background: withAlpha(theme.colors.secondary, 80)
            }}
          >
            {theme.logoUrl ? (
              <img
                src={theme.logoUrl}
                alt="Logo da vitrine"
                className="size-full object-cover"
              />
            ) : (
              <span
                className="size-full rounded-full"
                style={{ background: withAlpha(theme.colors.secondary, 40) }}
              />
            )}
          </div>

          <p
            className="truncate text-sm font-bold"
            style={{ color: theme.colors.text }}
          >
            {name || 'Nome da vitrine'}
          </p>
          <p
            className="truncate text-[11px]"
            style={{ color: withAlpha(theme.colors.text, 55) }}
          >
            Aberto agora · responde no WhatsApp
          </p>
        </div>

        {/* Grid / Lista de produtos */}
        <div
          className={cn(
            'grid gap-2.5 px-4 pb-4',
            isList ? 'grid-cols-1' : 'grid-cols-2'
          )}
        >
          {PLACEHOLDER_CARDS.map((i) =>
            isList ? (
              /* Card modo LISTA */
              <div
                key={i}
                className="flex flex-row items-center overflow-hidden rounded-lg border"
                style={{ borderColor: withAlpha(theme.colors.text, 12) }}
              >
                {/* Thumbnail */}
                <div
                  className="h-[52px] w-[68px] shrink-0"
                  style={{ background: withAlpha(theme.colors.secondary, 25) }}
                />
                {/* Texto */}
                <div className="flex flex-1 flex-col gap-1.5 px-3 py-2">
                  <span
                    className="h-2 w-4/5 rounded-full"
                    style={{ background: withAlpha(theme.colors.text, 25) }}
                  />
                  <span
                    className="h-2 w-3/5 rounded-full"
                    style={{ background: withAlpha(theme.colors.text, 18) }}
                  />
                </div>
              </div>
            ) : (
              /* Card modo GRADE */
              <div
                key={i}
                className="flex flex-col overflow-hidden rounded-lg border"
                style={{ borderColor: withAlpha(theme.colors.text, 12) }}
              >
                {/* Imagem — portrait, tall */}
                <div
                  className="aspect-[3/4] w-full"
                  style={{ background: withAlpha(theme.colors.secondary, 20) }}
                />
                {/* Texto + CTA */}
                <div className="flex flex-col gap-1.5 p-2.5">
                  <span
                    className="h-2 w-3/5 rounded-full"
                    style={{ background: withAlpha(theme.colors.text, 25) }}
                  />
                  {showPrices ? (
                    <span
                      className="h-2 w-2/5 rounded-full"
                      style={{ background: withAlpha(theme.colors.text, 18) }}
                    />
                  ) : (
                    <span
                      className="text-[10px] font-medium"
                      style={{ color: theme.colors.text }}
                    >
                      Consultar →
                    </span>
                  )}
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
