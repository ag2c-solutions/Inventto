import {
  Avatar,
  AvatarFallback,
  AvatarImage
} from '@/shared/components/ui/avatar';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { cn } from '@/shared/utils';

import type { IProductImage } from '../../../domain/entities';
import { useSourceProductVariantsQuery } from '../../hooks/use-queries';
import { getImageSrc } from '../../utils/get-img-src';
import { VariantOptionBadge } from '../variants-options-badge';

interface ImportVariantsPanelProps {
  sourceOrganizationId?: string;
  productId: string;
  enabled: boolean;
}

const GRID =
  'grid grid-cols-[2.5rem_minmax(8rem,12rem)_1fr] items-center gap-6';

export function ImportVariantsPanel({
  sourceOrganizationId,
  productId,
  enabled
}: ImportVariantsPanelProps) {
  const { data: variants, isLoading } = useSourceProductVariantsQuery({
    sourceOrganizationId,
    productId,
    enabled
  });

  return (
    <div className="bg-sidebar px-4 py-3">
      <div className="overflow-hidden rounded-lg border bg-card">
        <div
          className={cn(
            GRID,
            'border-b bg-muted/30 px-4 py-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground'
          )}
        >
          <span />
          <span>SKU</span>
          <span>Atributos</span>
        </div>

        {isLoading ? (
          <div className="flex flex-col gap-2 p-3">
            {Array.from({ length: 2 }).map((_, index) => (
              <Skeleton key={index} className="h-10 w-full rounded-md" />
            ))}
          </div>
        ) : !variants?.length ? (
          <p className="px-4 py-4 text-sm text-muted-foreground">
            Nenhuma variante encontrada para este produto.
          </p>
        ) : (
          variants.map((variant) => {
            const imageSrc =
              variant.imageUrl || variant.imagePublicId
                ? getImageSrc(
                    {
                      url: variant.imageUrl ?? '',
                      publicId: variant.imagePublicId
                    } as IProductImage,
                    150
                  )
                : undefined;

            return (
              <div
                key={variant.id}
                className={cn(GRID, 'border-b px-4 py-3 last:border-b-0')}
              >
                <Avatar className="size-9 rounded-md border border-border bg-sidebar">
                  {imageSrc && (
                    <AvatarImage
                      src={imageSrc}
                      alt={variant.sku}
                      className="object-cover"
                    />
                  )}
                  <AvatarFallback className="rounded-md bg-sidebar text-[10px] text-muted-foreground">
                    IMG
                  </AvatarFallback>
                </Avatar>

                <span className="truncate font-mono text-sm text-foreground">
                  {variant.sku}
                </span>

                <div className="flex flex-wrap items-center gap-1.5">
                  {variant.options.map((option, index) => (
                    <VariantOptionBadge
                      key={`${variant.id}-${option.name}-${index}`}
                      option={option}
                    />
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
