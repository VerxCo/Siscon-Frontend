import { useState, type FormEvent } from 'react';
import { Shield, LoaderCircle, CircleAlert, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import type { LoginRequest } from '../../types';

export function LoginScreen() {
  const { signIn, authStatus } = useAuth();
  const [form, setForm] = useState<LoginRequest>({ email: '', senha: '' });
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setNotice(null);

 try {
  await signIn(form.email, form.senha);

  setForm({ email: '', senha: '' });

  setNotice('Login realizado com sucesso.');

} catch (err: any) {
  console.error(err);

  setError(
    err?.message || 'Email ou senha inválidos.'
  );

} finally {
  setBusy(false);
}

  return (
    <main className="login-screen">
      <section className="login-panel">
        <div className="login-brand">
          <Shield size={18} />
          <span>Siscon</span>
        </div>

        <h1>Acesso ao painel</h1>
        <p className="muted">Autenticação via backend atual do projeto.</p>

        {error ? (
          <div className="banner banner-error">
            <CircleAlert size={16} />
            <span>{error}</span>
          </div>
        ) : null}

        {notice ? (
          <div className="banner banner-success">
            <CheckCircle2 size={16} />
            <span>{notice}</span>
          </div>
        ) : null}

        <form className="login-form" onSubmit={handleSubmit}>
          <label className="field">
            <span>Email</span>
            <input
              type="email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              placeholder="admin@admin.com"
              autoComplete="email"
              required
            />
          </label>

          <label className="field">
            <span>Senha</span>
            <input
              type="password"
              value={form.senha}
              onChange={(event) => setForm({ ...form, senha: event.target.value })}
              placeholder="123456"
              autoComplete="current-password"
              required
            />
          </label>

          <button type="submit" className="primary-button" disabled={busy}>
            {busy ? <LoaderCircle size={16} className="spin" /> : <Shield size={16} />}
            Entrar
          </button>
        </form>

        <div className="login-hint">
          <strong>Perfis:</strong> admin, editor e viewer.
        </div>
      </section>
    </main>
  );
}
