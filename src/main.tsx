import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import './styles.css';

// Initialize theme from localStorage before React mounts
(function initTheme() {
  const savedTheme = localStorage.getItem('theme');
  const root = document.documentElement;

  if (savedTheme === 'light') {
    root.classList.add('light');
    root.classList.remove('dark');
  } else {
    // Default to dark theme
    root.classList.add('dark');
    root.classList.remove('light');
  }
})();

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
);
