import { useAuth } from '../../../contexts/AuthContext';

export function SecuritySettings({ onClose }: { onClose: () => void }) {
  const { user } = useAuth();

  function formatDate(dateString?: string | null): string {
    if (!dateString) return 'Nunca';
    try {
      return new Date(dateString).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Data inválida';
    }
  }

  function getSecurityStatus(): { label: string; color: string } {
    if (!user?.password_changed_at) {
      return { label: 'Senha nunca alterada', color: '#ef4444' };
    }

    const changedDate = new Date(user.password_changed_at);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    if (changedDate > thirtyDaysAgo) {
      return { label: 'Senha atualizada recentemente', color: '#22c55e' };
    } else {
      return { label: 'Senha antiga (considere alterar)', color: '#f59e0b' };
    }
  }

  const status = getSecurityStatus();

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
          Segurança
        </h2>

        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ color: 'var(--text-primary, #fff)', fontSize: '1rem', marginBottom: '0.5rem' }}>
            Última troca de senha
          </h3>
          <p style={{ color: 'var(--text-secondary, #aaa)', fontSize: '0.9rem' }}>
            {formatDate(user?.password_changed_at)}
          </p>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ color: 'var(--text-primary, #fff)', fontSize: '1rem', marginBottom: '0.5rem' }}>
            Status de segurança
          </h3>
          <div
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              backgroundColor: status.color + '20',
              color: status.color,
              fontSize: '0.9rem',
              display: 'inline-block',
            }}
          >
            {status.label}
          </div>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ color: 'var(--text-primary, #fff)', fontSize: '1rem', marginBottom: '0.5rem' }}>
            Último login
          </h3>
          <p style={{ color: 'var(--text-secondary, #aaa)', fontSize: '0.9rem' }}>
            Funcionalidade futura (dados do Supabase Auth)
          </p>
        </div>

        {/* Future: MFA, Active Sessions */}
        <div
          style={{
            padding: '1rem', border: '1px dashed #444', borderRadius: '8px',
            color: 'var(--text-secondary, #aaa)', fontSize: '0.85rem', textAlign: 'center',
          }}
        >
          🔒 MFA e histórico de sessões serão implementados em versões futuras
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
          <button
            type="button" onClick={onClose}
            style={{
              padding: '0.5rem 1.5rem', backgroundColor: 'var(--accent, #646cff)',
              color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer',
            }}
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
