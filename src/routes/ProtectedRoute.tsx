import { useAuth } from '../contexts/AuthContext';
import { LoginScreen } from '../components/auth/LoginScreen';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { authStatus } = useAuth();

  if (authStatus === 'loading' && localStorage.getItem('token')) {
    // Só mostrar loading se há um token salvo (restaurando sessão)
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

  // ✅ LoginScreen permanece visível mesmo em loading
  if (authStatus !== 'authenticated') {
    return <LoginScreen />;
  }

  return <>{children}</>;
}