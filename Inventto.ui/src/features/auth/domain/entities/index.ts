import type { Session as SupabaseSession } from '@supabase/supabase-js';

export type Session = SupabaseSession;

export interface AuthContextType {
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
