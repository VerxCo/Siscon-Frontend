import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { AuthUser } from '../types';
import * as authService from '../services/authService';

const TOKEN_KEY = 'siscon.front.token';

export interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  bootstrapped: boolean;
  authenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem(TOKEN_KEY));
  const [loading, setLoading] = useState(false);
  const [bootstrapped, setBootstrapped] = useState(false);

  const authenticated = !!user && !!token;

  /**
   * Restaura sessão ao montar o provider
   * Tenta recuperar sessão do Supabase e sincronizar com backend customizado
   */
  useEffect(() => {
    async function bootstrap() {
      try {
        const session = await authService.getSession();

        if (session.accessToken) {
          // Sincroniza com backend customizado para obter perfil do usuário
          const { ApiClient } = await import('../lib/api');
          const api = new ApiClient(session.accessToken);
          const meResp = await api.me();

          setToken(session.accessToken);
          setUser(meResp);
          localStorage.setItem(TOKEN_KEY, session.accessToken);
        }
      } catch (err) {
        console.error('Erro ao restaurar sessão:', err);
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setUser(null);
      } finally {
        setBootstrapped(true);
      }
    }

    bootstrap();
  }, []);

  /**
   * Login via authService + backend customizado
   */
  const signIn = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const session = await authService.signIn(email, password);

      // Obtém perfil do backend customizado
      const { ApiClient } = await import('../lib/api');
      const api = new ApiClient(session.accessToken);
      const meResp = await api.me();

      setToken(session.accessToken);
      setUser(meResp);
      localStorage.setItem(TOKEN_KEY, session.accessToken);
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Logout via authService + limpeza local
   */
  const signOut = useCallback(async () => {
    try {
      await authService.signOut();
    } catch (err) {
      console.error('Erro ao fazer logout no Supabase:', err);
    } finally {
      localStorage.removeItem(TOKEN_KEY);
      setToken(null);
      setUser(null);
    }
  }, []);

  const value: AuthContextType = {
    user,
    token,
    loading,
    bootstrapped,
    authenticated,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return context;
}
