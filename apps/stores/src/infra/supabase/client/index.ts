import { createClient } from '@supabase/supabase-js';

import { SUPABASE_ANON_KEY, SUPABASE_URL } from '../constants';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// tempClient é usado para criar usuários sem deslogar o usuário autenticado atual.
// Não substituir por supabase — isso encerraria a sessão do OWNER.
export const tempClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
    storageKey: 'temp-supabase-auth'
  }
});
