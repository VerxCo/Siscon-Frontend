import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { PasswordChangeModal } from './PasswordChangeModal';

interface PasswordRecommendationModalProps {
  onDismiss: () => void;
}

export function PasswordRecommendationModal({ onDismiss }: PasswordRecommendationModalProps) {
  const { user } = useAuth();
  const [showChangeModal, setShowChangeModal] = useState(false);

  return (
    <>
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}
        onClick={onDismiss} // Dismiss on outside click
      >
        <div
          style={{
            backgroundColor: 'var(--bg-secondary, #1e1e1e)',
            padding: '2rem',
            borderRadius: '8px',
            minWidth: '400px',
            maxWidth: '90vw',
            position: 'relative',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={onDismiss}
            style={{
              position: 'absolute',
              top: '0.5rem',
              right: '0.5rem',
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary, #aaa)',
              fontSize: '1.5rem',
              cursor: 'pointer',
            }}
            aria-label="Fechar"
          >
            ×
          </button>
          <h2 style={{ marginTop: 0, color: 'var(--text-primary, #fff)' }}>
            Recomendação de Segurança
          </h2>
          <p style={{ color: 'var(--text-secondary, #aaa)' }}>
            Usuário: {user?.full_name || user?.email}
            <br />
            Recomendamos alterar sua senha para maior segurança. Você pode fazer isso agora ou depois.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onDismiss}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: 'transparent',
                color: 'var(--text-secondary, #aaa)',
                border: '1px solid var(--text-secondary, #aaa)',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Depois
            </button>
            <button
              type="button"
              onClick={() => setShowChangeModal(true)}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: 'var(--accent, #646cff)',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Trocar Senha Agora
            </button>
          </div>
        </div>
      </div>
      {showChangeModal && (
        <PasswordChangeModal onClose={() => setShowChangeModal(false)} />
      )}
    </>
  );
}