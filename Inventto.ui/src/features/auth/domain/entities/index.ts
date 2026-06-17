import type {
  AuthChangeEvent as SupabaseAuthChangeEvent,
  Session as SupabaseSession
} from '@supabase/supabase-js';

export type Session = SupabaseSession;
export type AuthChangeEvent = SupabaseAuthChangeEvent;

export interface AuthContextType {
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
