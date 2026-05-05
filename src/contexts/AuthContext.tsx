import { createContext, useContext, type ReactNode } from 'react';
import type { AuthUser } from '../types';

export interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  // Placeholders para implementação futura (Fases 2-5)
  signIn?: (email: string, password: string) => Promise<void>;
  signOut?: () => Promise<void>;
  mustChangePassword?: boolean;
  completePasswordChange?: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const value: AuthContextType = {
    user: null,
    loading: false,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return context;
}