import { formatDecimalToInteger, formatIntegerToDecimal } from '@/shared/utils';

import { formatVariantOptions } from '@/features/products';

import type {
  ConfirmSaleInput,
  PdvCatalog,
  PdvCustomer,
  PdvProduct
} from '../../domain/entities';
import type {
  CreatePosSaleDTO,
  LookupPosCustomerDTO,
  PdvCatalogItemDTO,
  PdvOrgCatalogDTO
} from '../dtos';

export class PdvCatalogMapper {
  static toDomain(dto: PdvOrgCatalogDTO): PdvCatalog | null {
    if (!dto.pdv_catalog_id || !dto.catalog) return null;

    return {
      id: dto.catalog.id,
      name: dto.catalog.name
    };
  }
}

export class PdvProductMapper {
  static toDomain(dto: PdvCatalogItemDTO): PdvProduct {
    const images = dto.product.product_images || [];
    const primaryImage = images.find((image) => image.is_primary) ?? images[0];
    const stock = dto.variant ? dto.variant.stock : dto.product.stock;
    const categoryId = dto.product.categories?.[0]?.category?.id;

    return {
      productId: dto.product_id,
      variantId: dto.variant_id ?? undefined,
      name: dto.product.name,
      variantLabel: dto.variant
        ? formatVariantOptions(dto.variant.options)
        : undefined,
      sku: dto.variant?.sku ?? dto.product.sku,
      price: formatDecimalToInteger(dto.price),
      stock,
      isOut: stock === 0,
      imageUrl: primaryImage?.url,
      categoryId
    };
  }
}

export class PdvSaleMapper {
  static toPersistence(input: ConfirmSaleInput): CreatePosSaleDTO {
    return {
      organization_id: input.organizationId,
      catalog_id: input.catalogId,
      customer: input.customer
        ? { phone: input.customer.phone, name: input.customer.name }
        : null,
      items: input.items.map((item) => ({
        product_id: item.productId,
        variant_id: item.variantId ?? null,
        quantity: item.quantity,
        reference_price: formatIntegerToDecimal(item.referencePrice),
        discount_amount: formatIntegerToDecimal(item.discountAmount),
        unit_price: formatIntegerToDecimal(
          item.referencePrice - item.discountAmount
        )
      })),
      payment_method: input.paymentMethod,
      // amount_paid só faz sentido em dinheiro — omitido nos demais.
      amount_paid:
        input.paymentMethod === 'cash' && input.amountPaid != null
          ? formatIntegerToDecimal(input.amountPaid)
          : undefined,
      payment_proof_url: input.paymentProofUrl
    };
  }
}

export class PdvCustomerMapper {
  static toDomain(dto: LookupPosCustomerDTO): PdvCustomer {
    return {
      customerId: dto.customer_id,
      name: dto.name,
      since: new Date(dto.since)
    };
  }
}
