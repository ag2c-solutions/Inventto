import { z } from 'zod';

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
