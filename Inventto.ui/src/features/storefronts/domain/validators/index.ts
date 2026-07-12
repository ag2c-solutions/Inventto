import { z } from 'zod';

import { CARD_STYLES } from '../entities';

// RN073-adjacent UI guard: confirmação de remoção por digitação do nome
// exato (tolerando espaços nas pontas) — a RPC não depende disso.
export function removeConfirmationValidator(
  confirmation: string,
  expectedName: string
): boolean {
  return confirmation.trim() === expectedName.trim();
}

// RN072: formato do slug (letras minúsculas, números e hífen — sem hífen
// nas pontas), espelhado com a checagem em check_slug_available (SQL).
export const SLUG_FORMAT_REGEX = /^[a-z0-9]+(-[a-z0-9]+)*$/;

// Rotas do app + termos de sistema — mantido espelhado com o array
// v_reserved da RPC check_slug_available em 11_storefronts_schema.sql.
export const RESERVED_SLUGS = [
  'auth',
  'admin',
  'api',
  'app',
  'login',
  'signup',
  'onboarding',
  'storefronts',
  'settings',
  'team',
  'products',
  'movements',
  'catalogos',
  'pdv',
  'dashboard',
  'novo'
];

export function isSlugFormatValid(slug: string): boolean {
  return (
    SLUG_FORMAT_REGEX.test(slug) &&
    slug.length >= 3 &&
    slug.length <= 50 &&
    !RESERVED_SLUGS.includes(slug)
  );
}

export const storefrontGeneralSchema = z.object({
  name: z.string().trim().min(1, 'Informe um nome para a vitrine.'),
  catalogId: z.string().optional(),
  slug: z
    .string()
    .trim()
    .optional()
    .refine((value) => !value || isSlugFormatValid(value), {
      message:
        'Use só letras minúsculas, números e hífen, de 3 a 50 caracteres.'
    }),
  whatsapp: z.string().trim().optional(),
  instagram: z.string().trim().optional(),
  facebook: z.string().trim().optional(),
  website: z.union([z.url('URL inválida'), z.literal('')]).optional()
});

export type StorefrontGeneralFormValues = z.infer<
  typeof storefrontGeneralSchema
>;

// RN da identidade visual: hex de 3 ou 6 dígitos (com #), espelhando o
// formato que <input type="color"> produz.
export const HEX_COLOR_REGEX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
const hexColorSchema = z.string().regex(HEX_COLOR_REGEX, 'Cor inválida.');

export const MAX_THEME_IMAGE_SIZE_MB = 5;
const themeImageFileSchema = z
  .instanceof(File)
  .refine((file) => file.size <= MAX_THEME_IMAGE_SIZE_MB * 1024 * 1024, {
    message: `A imagem deve ter até ${MAX_THEME_IMAGE_SIZE_MB}MB.`
  })
  .refine(
    (file) => ['image/png', 'image/jpeg', 'image/webp'].includes(file.type),
    {
      message: 'Use uma imagem PNG, JPG ou WEBP.'
    }
  )
  .optional();

export const storefrontThemeSchema = z.object({
  colors: z.object({
    primary: hexColorSchema,
    background: hexColorSchema,
    secondary: hexColorSchema,
    text: hexColorSchema
  }),
  logoUrl: z.string().optional(),
  logoFile: themeImageFileSchema,
  coverUrl: z.string().optional(),
  coverFile: themeImageFileSchema,
  layout: z.enum(['grid', 'list']),
  cardStyle: z.enum(CARD_STYLES)
});

export type StorefrontThemeFormValues = z.infer<typeof storefrontThemeSchema>;

// RN076/RN077: sem limite de negócio documentado para a mensagem — só um
// teto razoável pra evitar textos absurdos no campo livre.
export const MAX_WHATSAPP_MESSAGE_LENGTH = 500;

export const storefrontBehaviorSchema = z.object({
  showPrices: z.boolean(),
  showSoldOut: z.boolean(),
  whatsappMessage: z
    .string()
    .trim()
    .max(
      MAX_WHATSAPP_MESSAGE_LENGTH,
      `A mensagem deve ter até ${MAX_WHATSAPP_MESSAGE_LENGTH} caracteres.`
    )
    .optional()
});

export type StorefrontBehaviorFormValues = z.infer<
  typeof storefrontBehaviorSchema
>;

export const storefrontConfigSchema = storefrontGeneralSchema.extend({
  theme: storefrontThemeSchema,
  behavior: storefrontBehaviorSchema
});

export type StorefrontConfigFormValues = z.infer<typeof storefrontConfigSchema>;
