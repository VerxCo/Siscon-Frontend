import { useState, type FormEvent } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabase';
import type { AuthUser } from '../../../types';

export function ProfileModal({ onClose }: { onClose: () => void }) {
  const { user, token } = useAuth();
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      if (!user?.user_id) throw new Error('Usuário não identificado');

      const { error: dbError } = await supabase
        .from('app_user_profiles')
        .update({
          full_name: fullName,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.user_id);

      if (dbError) throw new Error(dbError.message);

      // Update local user state (via AuthContext if possible, or force reload)
      setSuccess(true);
      setTimeout(() => onClose(), 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar perfil');
    } finally {
      setLoading(false);
    }
  }

  function formatRole(role: string): string {
    switch (role) {
      case 'admin': return 'Administrador';
      case 'editor': return 'Editor';
      case 'viewer': return 'Visualizador';
      default: return role;
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.85)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 9999,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'var(--bg-secondary, #1e1e1e)',
          padding: '2rem', borderRadius: '8px',
          minWidth: '400px', maxWidth: '90vw', position: 'relative',
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
          Meu Perfil
        </h2>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-primary, #fff)' }}>
              Nome Completo
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #444', background: '#1f2937', color: '#fff' }}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-primary, #fff)' }}>
              Email (leitura)
            </label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #444', background: '#2a2a2a', color: '#aaa' }}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-primary, #fff)' }}>
              Permissão (leitura)
            </label>
            <input
              type="text"
              value={formatRole(user?.role || '')}
              disabled
              style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #444', background: '#2a2a2a', color: '#aaa' }}
            />
          </div>

          {error && (
            <div style={{ color: '#ef4444', marginBottom: '1rem', fontSize: '0.9rem' }}>
              {error}
            </div>
          )}

          {success && (
            <div style={{ color: '#22c55e', marginBottom: '1rem', fontSize: '0.9rem' }}>
              Perfil atualizado com sucesso!
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
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
