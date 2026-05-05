import { useState, type FormEvent } from 'react';
import { useAuth } from '../../contexts/AuthContext';

export function PasswordChangeModal() {
  const { completePasswordChange, user } = useAuth();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    setLoading(true);
    try {
      await completePasswordChange(newPassword);
      // On success, AuthContext will change authStatus to 'authenticated'
      // Modal will unmount via ProtectedRoute
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao alterar senha');
    } finally {
      setLoading(false);
    }
  }

  // Block ESC key
  useState(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') e.preventDefault();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.85)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
      }}
      onClick={(e) => e.stopPropagation()} // Block outside click
    >
      <div
        style={{
          backgroundColor: 'var(--bg-secondary, #1e1e1e)',
          padding: '2rem',
          borderRadius: '8px',
          minWidth: '400px',
          maxWidth: '90vw',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ marginTop: 0, color: 'var(--text-primary, #fff)' }}>
          Troca Obrigatória de Senha
        </h2>
        <p style={{ color: 'var(--text-secondary, #aaa)' }}>
          Usuário: {user?.full_name || user?.email}
          <br />
          Você deve alterar sua senha no primeiro acesso.
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-primary, #fff)' }}>
              Nova Senha
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              required
              minLength={6}
              style={{ width: '100%', padding: '0.5rem' }}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-primary, #fff)' }}>
              Confirmar Nova Senha
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Digite novamente"
              required
              minLength={6}
              style={{ width: '100%', padding: '0.5rem' }}
            />
          </div>

          {error && (
            <div style={{ color: '#ff6b6b', marginBottom: '1rem', fontSize: '0.9rem' }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: 'var(--accent, #646cff)',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Alterando...' : 'Alterar Senha'}
          </button>
        </form>
      </div>
    </div>
  );
}
