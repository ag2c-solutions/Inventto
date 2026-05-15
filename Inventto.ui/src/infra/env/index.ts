import type { Env } from './schema';
import { envSchema } from './schema';

type RawEnv = Record<string, string | undefined>;

export function validateEnv(raw: RawEnv): Env {
  const input = {
    supabase: {
      url: raw['VITE_SUPABASE_URL'],
      anonKey: raw['VITE_SUPABASE_ANON_KEY']
    },
    cloudinary: {
      cloudName: raw['VITE_CLOUDINARY_NAME'],
      presetName: raw['VITE_CLOUDINARY_PRESET_NAME']
    },
    api: {
      baseUrl: raw['VITE_API_BASE_URL']
    }
  };

  const result = envSchema.safeParse(input);

  if (!result.success) {
    const missing = result.error.issues.map((issue) => {
      const field = issue.path.join('.');
      return `  - ${field}: ${issue.message}`;
    });

    throw new Error(
      `[env] Variáveis de ambiente inválidas ou ausentes:\n${missing.join('\n')}`
    );
  }

  return result.data;
}

export const env = validateEnv(import.meta.env);
