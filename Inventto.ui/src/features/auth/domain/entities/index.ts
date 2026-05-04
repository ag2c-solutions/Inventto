import type {
  Session as SupabaseSession,
  User as SupabaseUser
} from '@supabase/supabase-js';

export type Session = SupabaseSession;
export type AuthUser = SupabaseUser;

export interface AuthContextType {
  session: Session | null;
  authUser: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
