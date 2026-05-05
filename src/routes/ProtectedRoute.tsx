import { useAuth } from '../contexts/AuthContext';
import { LoginScreen } from '../components/auth/LoginScreen';
import { PasswordChangeModal } from '../components/auth/PasswordChangeModal';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { authStatus } = useAuth();

  // Loading state: block everything
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

  // Unauthenticated: show login
  if (authStatus === 'unauthenticated') {
    return <LoginScreen />;
  }

  // Must change password: block app, show modal
  if (authStatus === 'must_change_password') {
    return (
      <div>
        {/* Render a minimal background or nothing */}
        <div style={{ filter: 'blur(4px)', pointerEvents: 'none' }}>
          {children}
        </div>
        <PasswordChangeModal />
      </div>
    );
  }

  // Authenticated: normal app
  return <>{children}</>;
}
