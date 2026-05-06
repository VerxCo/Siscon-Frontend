import { useState, useEffect, type FormEvent } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { changePassword } from '../../../services/passwordService';

export function ChangePasswordModal({ onClose }: { onClose: () => void }) {
  const { user } = useAuth();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!passwordRegex.test(newPassword)) {
      setError('A senha deve conter no mínimo 8 caracteres, incluindo letra maiúscula, minúscula, número e caractere especial.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    setLoading(true);
    try {
      if (!user?.user_id) throw new Error('Usuário não identificado');

      await changePassword({ userId: user.user_id, newPassword });
      setSuccess(true);
      setTimeout(() => onClose(), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao alterar senha');
    } finally {
      setLoading(false);
    }
  }

  // Block ESC key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') e.preventDefault();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex',
        alignItems: 'center', justifyContent: 'center', zIndex: 9999,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'var(--bg-secondary, #1e1e1e)', padding: '2rem',
          borderRadius: '8px', minWidth: '400px', maxWidth: '90vw', position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button" onClick={onClose}
          style={{
            position: 'absolute', top: '0.5rem', right: '0.5rem',
            background: 'none', border: 'none', color: 'var(--text-secondary, #aaa)',
            fontSize: '1.5rem', cursor: 'pointer',
          }}
          aria-label="Fechar"
        >
          ×
        </button>

        <h2 style={{ marginTop: 0, color: 'var(--text-primary, #fff)' }}>
          Alterar Senha
        </h2>
        <p style={{ color: 'var(--text-secondary, #aaa)' }}>
          Usuário: {user?.full_name || user?.email}
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
              placeholder="Mínimo 8 caracteres, maiúscula, minúscula, número, especial"
              required
              minLength={8}
              style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #444', background: '#1f2937', color: '#fff' }}
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
              placeholder="Confirme a nova senha"
              required
              minLength={8}
              style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #444', background: '#1f2937', color: '#fff' }}
            />
          </div>

          {error && (
            <div style={{ color: '#ef4444', marginBottom: '1rem', fontSize: '0.9rem' }}>
              {error}
            </div>
          )}

          {success && (
            <div style={{ color: '#22c55e', marginBottom: '1rem', fontSize: '0.9rem' }}>
              Senha alterada com sucesso!
            </div>
          )}

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button
              type="button" onClick={onClose}
              disabled={loading}
              style={{
                padding: '0.5rem 1rem', backgroundColor: 'transparent',
                color: 'var(--text-secondary, #aaa)', border: '1px solid var(--text-secondary, #aaa)',
                borderRadius: '4px', cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              Cancelar
            </button>
            <button
              type="submit" disabled={loading}
              style={{
                padding: '0.5rem 1rem', backgroundColor: 'var(--accent, #646cff)',
                color: '#fff', border: 'none', borderRadius: '4px',
                cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? 'Alterando...' : 'Alterar Senha'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
