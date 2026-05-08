import type { IProductVariant } from '../../domain/entities';

export const formatVariantOptions = (options: IProductVariant['options']) => {
  return options.map((opt) => `${opt.name}: ${opt.value}`).join(' / ');
};
