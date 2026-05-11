import { z } from 'zod';

export const envSchema = z.object({
  supabase: z.object({
    url: z
      .string({ error: 'VITE_SUPABASE_URL é obrigatória' })
      .min(1, 'VITE_SUPABASE_URL é obrigatória'),
    anonKey: z
      .string({ error: 'VITE_SUPABASE_ANON_KEY é obrigatória' })
      .min(1, 'VITE_SUPABASE_ANON_KEY é obrigatória')
  }),
  cloudinary: z.object({
    cloudName: z
      .string({ error: 'VITE_CLOUDINARY_NAME é obrigatória' })
      .min(1, 'VITE_CLOUDINARY_NAME é obrigatória'),
    presetName: z
      .string({ error: 'VITE_CLOUDINARY_PRESET_NAME é obrigatória' })
      .min(1, 'VITE_CLOUDINARY_PRESET_NAME é obrigatória')
  }),
  api: z.object({
    baseUrl: z
      .string({ error: 'VITE_API_BASE_URL é obrigatória' })
      .min(1, 'VITE_API_BASE_URL é obrigatória')
  })
});

export type Env = z.infer<typeof envSchema>;
