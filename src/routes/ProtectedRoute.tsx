import { useAuth } from '../contexts/AuthContext';
import { LoginScreen } from '../components/auth/LoginScreen';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { authStatus } = useAuth();

  if (authStatus === 'loading') {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          color: 'var(--text-primary, #fff)',
          fontSize: '1.2rem',
        }}
      >
        Carregando...
      </div>
    );
  }

  if (authStatus === 'unauthenticated') {
    return <LoginScreen />;
  }

  return <>{children}</>;
}