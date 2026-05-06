import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { AuthUser, AuthStatus } from '../types';
import * as authService from '../services/authService';
import * as userService from '../services/userService';
import * as passwordService from '../services/passwordService';
import { TOKEN_KEY } from '../constants';

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  authStatus: AuthStatus;
  showPasswordRecommendation: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  completePasswordChange: (newPassword: string) => Promise<void>;
  dismissPasswordRecommendation: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem(TOKEN_KEY));
  const [authStatus, setAuthStatus] = useState<AuthStatus>('loading');
  const [showPasswordRecommendation, setShowPasswordRecommendation] = useState(false);

  useEffect(() => {
    async function bootstrap() {
      try {
        const session = await authService.getSession();

        if (!session.accessToken) {
          setAuthStatus('unauthenticated');
          return;
        }

        const profile = await userService.getUserProfile(session.user?.id as string);
        setUser(profile);
        setToken(session.accessToken);
        localStorage.setItem(TOKEN_KEY, session.accessToken);

        setAuthStatus('authenticated');
        console.log('Profile must_change_password:', profile.must_change_password);
        setShowPasswordRecommendation(Boolean(profile.must_change_password));
      } catch (err) {
        console.error('Erro no bootstrap:', err);
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setUser(null);
        setAuthStatus('unauthenticated');
      }
    }

    bootstrap();
  }, []);


const signIn = useCallback(async (email: string, password: string) => {
  setAuthStatus('loading');

  try {
    const session = await authService.signIn(email, password);

    if (!session?.user?.id) {
      throw new Error('Usuário não encontrado.');
    }

    const profile = await userService.getUserProfile(session.user.id);

    if (!profile) {
      throw new Error('Perfil do usuário não encontrado.');
    }

    setUser(profile);
    setToken(session.accessToken);
    localStorage.setItem(TOKEN_KEY, session.accessToken);
    setAuthStatus('authenticated');
    setShowPasswordRecommendation(Boolean(profile.must_change_password));

  } catch (err: any) {
    console.error('Erro no login:', err);

    // Primeiro restaurar o estado
    setAuthStatus('unauthenticated');

    // Depois lançar o erro para o LoginScreen capturar
    const errorMessage = err?.message || 'Falha ao autenticar.';
    throw new Error(errorMessage);
  }
}, []);

   const signOut = useCallback(async () => {
  try {
    await authService.signOut();
  } catch (err) {
    console.error('Erro no logout:', err);
  } finally {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
    setAuthStatus('unauthenticated');
    setShowPasswordRecommendation(false);
  }
}, []);


  const completePasswordChange = useCallback(async (newPassword: string) => {
    if (!user?.user_id) throw new Error('Usuário não identificado');

    setAuthStatus('loading');
    try {
      await passwordService.changePassword({ userId: user.user_id, newPassword });

      setUser((prev) => prev ? { ...prev, must_change_password: false, password_changed_at: new Date().toISOString() } : null);
      setAuthStatus('authenticated');
      setShowPasswordRecommendation(false); // Dismiss recommendation after change
    } catch (err) {
      setAuthStatus('authenticated'); // Stay authenticated even on error
      throw err;
    }
  }, [user?.user_id]);

  const dismissPasswordRecommendation = useCallback(() => {
    setShowPasswordRecommendation(false);
  }, []);

  const value: AuthContextType = {
    user,
    token,
    authStatus,
    showPasswordRecommendation,
    signIn,
    signOut,
    completePasswordChange,
    dismissPasswordRecommendation,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return context;
}