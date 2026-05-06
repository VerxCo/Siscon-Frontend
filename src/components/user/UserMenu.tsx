import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { LogOut, Settings, UserCircle, Shield, Palette } from 'lucide-react';
import type { UserRole } from '../../types';
import { ProfileModal } from './modals/ProfileModal';
import { ChangePasswordModal } from './modals/ChangePasswordModal';
import { SecuritySettings } from './modals/SecuritySettings';
import { PreferencesModal } from './modals/PreferencesModal';

function formatRole(role: UserRole): string {
  switch (role) {
    case 'admin': return 'Administrador';
    case 'editor': return 'Editor';
    case 'viewer': return 'Visualizador';
    default: return role;
  }
}

function getInitials(name?: string | null): string {
  if (!name) return '?';
  const parts = name.split(' ');
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.substring(0, 2).toUpperCase();
}

export function UserMenu() {
  const { user, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<
    'profile' | 'password' | 'security' | 'preferences' | null
  >(null);

  if (!user) return null;

  function handleClickOutside(e: MouseEvent) {
    if ((e.target as HTMLElement).closest('.user-menu-container')) return;
    setIsOpen(false);
  }

  // Close on outside click
  useState(() => {
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  });

  // Close on ESC
  useState(() => {
    function handleESC(e: KeyboardEvent) {
      if (e.key === 'Escape') setIsOpen(false);
    }
    window.addEventListener('keydown', handleESC);
    return () => window.removeEventListener('keydown', handleESC);
  });

  return (
    <div className="user-menu-container" style={{ position: 'relative' }}>
      {/* Trigger */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '0.75rem',
          cursor: 'pointer',
          borderRadius: '8px',
          backgroundColor: isOpen ? 'var(--bg-hover, #2a2a2a)' : 'transparent',
          transition: 'background-color 0.2s',
        }}
      >
        {/* Avatar */}
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: 'var(--accent, #646cff)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 'bold',
            fontSize: '0.9rem',
          }}
        >
          {getInitials(user.full_name)}
        </div>

        {/* User Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-primary, #fff)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {user.full_name || 'Usuário'}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary, #aaa)' }}>
            {formatRole(user.role)}
          </div>
        </div>

        {/* Settings Icon */}
        <Settings size={16} color="var(--text-secondary, #aaa)" />
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            bottom: '100%',
            left: 0,
            right: 0,
            marginBottom: '0.5rem',
            backgroundColor: 'var(--bg-secondary, #1e1e1e)',
            borderRadius: '8px',
            border: '1px solid var(--border, #333)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            zIndex: 1000,
            overflow: 'hidden',
          }}
        >
          {/* User Info Header */}
          <div style={{ padding: '1rem', borderBottom: '1px solid var(--border, #333)' }}>
            <div style={{ fontWeight: 500, color: 'var(--text-primary, #fff)' }}>{user.full_name || 'Usuário'}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary, #aaa)' }}>{user.email}</div>
          </div>

          {/* Menu Items */}
          <div style={{ padding: '0.5rem' }}>
            <button
              type="button"
              onClick={() => { setIsOpen(false); setActiveModal('profile'); }}
              style={menuItemStyle}
            >
              <UserCircle size={16} />
              <span>Meu Perfil</span>
            </button>

            <button
              type="button"
              onClick={() => { setIsOpen(false); setActiveModal('password'); }}
              style={menuItemStyle}
            >
              <Shield size={16} />
              <span>Alterar Senha</span>
            </button>

            <button
              type="button"
              onClick={() => { setIsOpen(false); setActiveModal('security'); }}
              style={menuItemStyle}
            >
              <Shield size={16} />
              <span>Segurança</span>
            </button>

            <button
              type="button"
              onClick={() => { setIsOpen(false); setActiveModal('preferences'); }}
              style={menuItemStyle}
            >
              <Palette size={16} />
              <span>Preferências</span>
            </button>
          </div>

          {/* Logout */}
          <div style={{ padding: '0.5rem', borderTop: '1px solid var(--border, #333)' }}>
            <button
              type="button"
              onClick={() => signOut()}
              style={{ ...menuItemStyle, color: '#ef4444' }}
            >
              <LogOut size={16} />
              <span>Sair</span>
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      {activeModal === 'profile' && (
        <ProfileModal onClose={() => setActiveModal(null)} />
      )}
      {activeModal === 'password' && (
        <ChangePasswordModal onClose={() => setActiveModal(null)} />
      )}
      {activeModal === 'security' && (
        <SecuritySettings onClose={() => setActiveModal(null)} />
      )}
      {activeModal === 'preferences' && (
        <PreferencesModal onClose={() => setActiveModal(null)} />
      )}
    </div>
  );
}

const menuItemStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  width: '100%',
  padding: '0.6rem 1rem',
  backgroundColor: 'transparent',
  border: 'none',
  borderRadius: '6px',
  color: 'var(--text-primary, #fff)',
  cursor: 'pointer',
  fontSize: '0.9rem',
  transition: 'background-color 0.15s',
};
