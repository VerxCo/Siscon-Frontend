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
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  completePasswordChange: (newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem(TOKEN_KEY));
  const [authStatus, setAuthStatus] = useState<AuthStatus>('loading');

  /**
   * Centralized bootstrap: restore session + fetch profile
   * Single source of truth for auth state transitions
   */
  useEffect(() => {
    async function bootstrap() {
      try {
        const session = await authService.getSession();

        if (!session.accessToken) {
          setAuthStatus('unauthenticated');
          return;
        }

        // Fetch profile from public.users (fail-safe: if fails, treat as unauthenticated)
        const profile = await userService.getUserProfile(session.user?.id as string);
        setUser(profile);
        setToken(session.accessToken);
        localStorage.setItem(TOKEN_KEY, session.accessToken);

        if (profile.must_change_password) {
          setAuthStatus('must_change_password');
        } else {
          setAuthStatus('authenticated');
        }
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

  /**
   * Login: sign in via Supabase, then fetch profile
   */
  const signIn = useCallback(async (email: string, password: string) => {
    setAuthStatus('loading');
    try {
      const session = await authService.signIn(email, password);
      // session.accessToken is set by authService.signIn (which returns SignInResult)
      // But our authService.signIn returns SignInResult with accessToken.
      // We'll use that token to fetch profile.
      const profile = await userService.getUserProfile(session.user?.id as string);
      setUser(profile);
      setToken(session.accessToken);
      localStorage.setItem(TOKEN_KEY, session.accessToken);

      if (profile.must_change_password) {
        setAuthStatus('must_change_password');
      } else {
        setAuthStatus('authenticated');
      }
    } catch (err) {
      setAuthStatus('unauthenticated');
      throw err;
    }
  }, []);

  /**
   * Logout: clear everything
   */
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
    }
  }, []);

  /**
   * Complete password change: called by PasswordChangeModal
   * Fail-safe: only updates DB if Auth succeeds
   */
  const completePasswordChange = useCallback(async (newPassword: string) => {
    if (!user?.user_id) throw new Error('Usuário não identificado');

    setAuthStatus('loading');
    try {
      await passwordService.changePassword({ userId: user.user_id, newPassword });

      // Update local user state
      setUser((prev) => prev ? { ...prev, must_change_password: false, password_changed_at: new Date().toISOString() } : null);
      setAuthStatus('authenticated');
    } catch (err) {
      setAuthStatus('must_change_password');
      throw err;
    }
  }, [user?.user_id]);

  const value: AuthContextType = {
    user,
    token,
    authStatus,
    signIn,
    signOut,
    completePasswordChange,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return context;
}
