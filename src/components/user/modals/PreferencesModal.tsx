import { useState, useEffect } from 'react';

export function PreferencesModal({ onClose }: { onClose: () => void }) {
  const [theme, setTheme] = useState<'dark' | 'light'>(
    () => (localStorage.getItem('theme') as 'dark' | 'light') || 'dark'
  );
  const [compactSidebar, setCompactSidebar] = useState<boolean>(
    () => localStorage.getItem('compactSidebar') === 'true'
  );

  // Apply theme on change
  useEffect(() => {
    localStorage.setItem('theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Apply compact sidebar on change
  useEffect(() => {
    localStorage.setItem('compactSidebar', String(compactSidebar));
    if (compactSidebar) {
      document.body.classList.add('sidebar-compact');
    } else {
      document.body.classList.remove('sidebar-compact');
    }
  }, [compactSidebar]);

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
          Preferências
        </h2>

        {/* Theme */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ color: 'var(--text-primary, #fff)', fontSize: '1rem', marginBottom: '0.5rem' }}>
            Tema
          </h3>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => setTheme('dark')}
              style={{
                flex: 1, padding: '0.5rem',
                backgroundColor: theme === 'dark' ? 'var(--accent, #646cff)' : 'transparent',
                color: theme === 'dark' ? '#fff' : 'var(--text-secondary, #aaa)',
                border: `1px solid ${theme === 'dark' ? 'var(--accent, #646cff)' : '#444'}`,
                borderRadius: '4px', cursor: 'pointer',
              }}
            >
              🌙 Dark
            </button>
            <button
              type="button"
              onClick={() => setTheme('light')}
              style={{
                flex: 1, padding: '0.5rem',
                backgroundColor: theme === 'light' ? 'var(--accent, #646cff)' : 'transparent',
                color: theme === 'light' ? '#fff' : 'var(--text-secondary, #aaa)',
                border: `1px solid ${theme === 'light' ? 'var(--accent, #646cff)' : '#444'}`,
                borderRadius: '4px', cursor: 'pointer',
              }}
            >
              ☀️ Light
            </button>
          </div>
        </div>

        {/* Language (Placeholder) */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ color: 'var(--text-primary, #fff)', fontSize: '1rem', marginBottom: '0.5rem' }}>
            Idioma (Em breve)
          </h3>
          <select
            disabled
            style={{
              width: '100%', padding: '0.5rem', borderRadius: '4px',
              border: '1px solid #444', background: '#2a2a2a', color: '#aaa',
            }}
          >
            <option>Português</option>
            <option>English</option>
            <option>Español</option>
          </select>
        </div>

        {/* Compact Sidebar */}
        <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--text-primary, #fff)', fontSize: '0.9rem' }}>
            Sidebar compacta
          </span>
          <button
            type="button"
            onClick={() => setCompactSidebar(!compactSidebar)}
            style={{
              padding: '0.4rem 1rem',
              backgroundColor: compactSidebar ? 'var(--accent, #646cff)' : 'transparent',
              color: compactSidebar ? '#fff' : 'var(--text-secondary, #aaa)',
              border: `1px solid ${compactSidebar ? 'var(--accent, #646cff)' : '#444'}`,
              borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem',
            }}
          >
            {compactSidebar ? 'Ativado' : 'Desativado'}
          </button>
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
