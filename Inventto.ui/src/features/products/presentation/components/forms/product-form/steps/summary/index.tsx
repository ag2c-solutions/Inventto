import { useMemo } from 'react';
import { TriangleAlert } from 'lucide-react';
import { useWatch } from 'react-hook-form';

import { useWizard } from '@/shared/components/common/wizard';

import type { IProductImage } from '../../../../../../domain/entities';
import { getImageSrc } from '../../../../../utils/get-img-src';
import { useProductForm } from '../../hook';

import { SummaryCard } from './summary-card';
import { SummaryItem } from './summary-item';

export function ProductSummary() {
  const { form } = useProductForm();
  const { state, actions } = useWizard();

  const name = useWatch({ control: form.control, name: 'name' });
  const sku = useWatch({ control: form.control, name: 'sku' });
  const categories = useWatch({ control: form.control, name: 'categories' });
  const minimumStock = useWatch({
    control: form.control,
    name: 'minimumStock'
  });

  const hasVariants = useWatch({ control: form.control, name: 'hasVariants' });
  const attributes = useWatch({ control: form.control, name: 'attributes' });
  const variants = useWatch({ control: form.control, name: 'variants' });
  const allImages = useWatch({ control: form.control, name: 'allImages' });

  const goToStepById = (stepId: string) => {
    const index = state.steps.findIndex((step) => step.id === stepId);

    if (index >= 0) actions.goToStep(index);
  };

  const categoriesLabel = useMemo(
    () =>
      (categories ?? [])
        .map((category) => category.name)
        .filter(Boolean)
        .join(', '),
    [categories]
  );

  const images = (allImages ?? []) as IProductImage[];

  const sortedImages = useMemo(() => {
    return [...images].sort((current, next) => {
      if (current.isPrimary === next.isPrimary) return 0;

      return current.isPrimary ? -1 : 1;
    });
  }, [images]);

  return (
    <div className="space-y-6 pb-6">
      <div>
        <h2 className="text-xl font-semibold">Resumo e confirmação</h2>
        <p className="text-sm text-muted-foreground">
          Revise tudo antes de salvar. Você pode voltar para ajustar qualquer
          passo.
        </p>
      </div>

      <SummaryCard
        title="Informações básicas"
        onEdit={() => goToStepById('BasicInfo')}
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <SummaryItem label="Nome" value={name || '—'} />
          <SummaryItem label="SKU" value={sku || '—'} mono />
          <SummaryItem label="Categorias" value={categoriesLabel || '—'} />
          <SummaryItem
            label="Estoque mínimo"
            value={hasVariants ? 'Por variante' : String(minimumStock ?? 0)}
          />
        </div>
      </SummaryCard>

      <SummaryCard title="Imagens" onEdit={() => goToStepById('Images')}>
        {sortedImages.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {sortedImages.map((image) => (
              <div
                key={image.id}
                className="relative size-30 overflow-hidden rounded-md border bg-muted"
              >
                <img
                  src={getImageSrc(image, 56)}
                  alt={image.name}
                  className="size-full object-cover"
                />
                {image.isPrimary && (
                  <span className="absolute inset-x-0 bottom-0 bg-foreground/80 py-0.5 text-center text-[7px] font-semibold uppercase tracking-wide text-background">
                    Destaque
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Sem imagens</p>
        )}
      </SummaryCard>

      {hasVariants && (
        <SummaryCard
          title="Variações"
          onEdit={() => goToStepById('Variations')}
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {(attributes ?? []).map((attribute) => (
              <SummaryItem
                key={attribute.name}
                label={attribute.name}
                value={(attribute.values ?? []).join(', ') || '—'}
              />
            ))}
            <div className="space-y-0.5 sm:col-span-2">
              <p className="text-xs text-muted-foreground">
                Total de variantes
              </p>
              <p className="text-sm">
                {variants?.length ?? 0}{' '}
                {(variants?.length ?? 0) === 1 ? 'variante' : 'variantes'}
              </p>
            </div>
          </div>
        </SummaryCard>
      )}

      <div className="flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 p-3 text-amber-900">
        <TriangleAlert className="mt-0.5 size-4 shrink-0" />
        <p className="text-xs">
          O produto nasce com estoque zero. Para adicionar estoque, registre uma
          entrada em Movimentações.
        </p>
      </div>
    </div>
  );
}
