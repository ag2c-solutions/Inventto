import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

import {
  Avatar,
  AvatarFallback,
  AvatarImage
} from '@/shared/components/ui/avatar';
import { Badge } from '@/shared/components/ui/badge';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { cn } from '@/shared/utils';

import type { ImportCandidate, IProductImage } from '../../../domain/entities';
import { getImageSrc } from '../../utils/get-img-src';

import { ImportVariantsPanel } from './import-variants-panel';

interface ImportCandidateRowProps {
  candidate: ImportCandidate;
  checked: boolean;
  disabled: boolean;
  sourceOrganizationId?: string;
  onCheckedChange: (checked: boolean) => void;
}

export function ImportCandidateRow({
  candidate,
  checked,
  disabled,
  sourceOrganizationId,
  onCheckedChange
}: ImportCandidateRowProps) {
  const [expanded, setExpanded] = useState(false);

  const isImported = candidate.alreadyImported;
  const { variantCount } = candidate;
  const hasVariants = variantCount > 0;

  const imageSrc =
    candidate.imageUrl || candidate.imagePublicId
      ? getImageSrc(
          {
            url: candidate.imageUrl ?? '',
            publicId: candidate.imagePublicId
          } as IProductImage,
          150
        )
      : undefined;

  return (
    <div className="flex flex-col">
      <div
        className={cn(
          'flex items-center gap-2 pr-3 transition-colors',
          isImported ? 'opacity-60' : 'hover:bg-muted/40'
        )}
      >
        <label
          htmlFor={`import-${candidate.id}`}
          className={cn(
            'flex min-w-0 flex-1 items-center gap-4 py-3.5 pl-4',
            isImported ? 'cursor-default' : 'cursor-pointer'
          )}
        >
          <Checkbox
            id={`import-${candidate.id}`}
            checked={isImported || checked}
            disabled={disabled}
            onCheckedChange={(value) => onCheckedChange(value === true)}
            aria-label={`Selecionar ${candidate.name}`}
          />

          <Avatar className="size-11 shrink-0 rounded-md border border-border bg-sidebar">
            {imageSrc && (
              <AvatarImage
                src={imageSrc}
                alt={candidate.name}
                className="object-cover"
              />
            )}
            <AvatarFallback className="rounded-md bg-sidebar text-xs text-muted-foreground">
              IMG
            </AvatarFallback>
          </Avatar>

          <span className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="truncate font-semibold text-foreground">
              {candidate.name}
            </span>
            <span className="flex items-center gap-2">
              <span className="truncate font-mono text-xs text-muted-foreground">
                {candidate.sku}
              </span>
              {hasVariants && (
                <Badge
                  variant="secondary"
                  className="shrink-0 px-1.5 py-0 text-[11px] font-normal text-muted-foreground"
                >
                  {variantCount} {variantCount === 1 ? 'variação' : 'variações'}
                </Badge>
              )}
            </span>
          </span>
        </label>

        {isImported && (
          <Badge
            variant="secondary"
            className="shrink-0 border border-border bg-transparent font-normal text-muted-foreground"
          >
            Já importado
          </Badge>
        )}

        {hasVariants && (
          <button
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            aria-label={
              expanded
                ? `Ocultar variantes de ${candidate.name}`
                : `Ver variantes de ${candidate.name}`
            }
            aria-expanded={expanded}
            className="flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ChevronDown
              className={cn(
                'size-4 transition-transform',
                expanded && 'rotate-180'
              )}
            />
          </button>
        )}
      </div>

      {expanded && hasVariants && (
        <ImportVariantsPanel
          sourceOrganizationId={sourceOrganizationId}
          productId={candidate.id}
          enabled={expanded}
        />
      )}
    </div>
  );
}
