import type { Category } from '../../categories/types';

export type ProductStockStatus = 'critical' | 'warning' | 'healthy';

export interface VariantOption {
  name: string;
  value: string;
}

export type AttributeType = 'text' | 'color' | 'number' | 'select';

export interface IProductAttribute {
  id: string;
  name: string;
  slug: string;
  type: AttributeType;
  values: string[];
}

export interface IProductImage {
  id: string;
  url: string;
  name: string;
  type: string;
  publicId?: string;
  isPrimary: boolean;
}

export interface IProductVariant {
  id: string;
  sku: string;
  stock: number;
  costPrice: number;
  minimumStock: number;
  isActive: boolean;
  images: IvariantImage[];
  options: VariantOption[];
}

export interface IvariantImage {
  id: string;
  isPrimary?: boolean;
}

export interface ProductBase {
  id: string;
  organizationId: string;
  name: string;
  sku: string;
  description?: string;
  categories: Category[];
  stock: number;
  minimumStock: number;
  costPrice?: number;
  isActive: boolean;
  attributes: IProductAttribute[];
  allImages?: IProductImage[];
  createdAt?: string;
  updatedAt?: string;
}

export interface IProductWithVariants extends ProductBase {
  hasVariants: true;
  variants: IProductVariant[];
}

export interface IProductWithoutVariants extends ProductBase {
  hasVariants: false;
  variants?: never;
}

export type IProduct = IProductWithVariants | IProductWithoutVariants;
