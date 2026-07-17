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

export interface SignInPayload {
  email: string;
  password: string;
}

export interface SignUpPayload {
  companyName: string;
  document?: string;
  fullName: string;
  email: string;
  password: string;
  businessAreaCode: string;
  acceptedTerms: true;
}

export interface VerifyOtpPayload {
  email: string;
  token: string;
}

export interface ResendOtpPayload {
  email: string;
}

export interface RecoverPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  newPassword: string;
}
