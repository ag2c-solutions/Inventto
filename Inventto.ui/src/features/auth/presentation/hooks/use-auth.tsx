import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';
import { toast } from 'sonner';

import type { AuthContextType, Session } from '../../domain/entities';
import { AuthService } from '../../domain/services';

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let unsubscribe: () => void;

    const initAuth = async () => {
      try {
        const session = await AuthService.getSession();
        setSession(session);
      } catch (error) {
        console.error('Erro na inicialização da auth:', error);
        toast.error(
          'Não foi possível inicializar a autenticação. Tente recarregar a página.'
        );
      } finally {
        setIsLoading(false);
      }

      const subscriptionResponse = await AuthService.subscribeToAuthChanges(
        (_event, newSession) => {
          setSession((prevSession) => {
            if (prevSession?.access_token === newSession?.access_token) {
              return prevSession;
            }
            return newSession;
          });

          setIsLoading(false);
        }
      );

      unsubscribe = subscriptionResponse;
    };

    initAuth();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextType>(
    () => ({
      session,
      isAuthenticated: !!session,
      isLoading
    }),
    [session, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}
