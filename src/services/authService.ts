import { supabase } from '../lib/supabase';
import type { AuthChangeEvent, User } from '@supabase/supabase-js';

export interface SignInResult {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: User;
}

export interface SessionResult {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
}

/**
 * Realiza login via cliente oficial Supabase
 * Substitui a chamada REST manual de lib/supabaseAuth.ts
 */
export async function signIn(email: string, password: string): Promise<SignInResult> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) throw new Error(`Falha no login: ${error.message}`);
  if (!data.session) throw new Error('Sessão não retornada pelo Supabase');

  return {
    accessToken: data.session.access_token,
    refreshToken: data.session.refresh_token,
    expiresIn: data.session.expires_in,
    user: data.user,
  };
}

/**
 * Realiza logout via Supabase Auth
 */
export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(`Falha no logout: ${error.message}`);
}

/**
 * Recupera sessão ativa do Supabase (para Fase 4 - restore session)
 */
export async function getSession(): Promise<SessionResult> {
  const { data, error } = await supabase.auth.getSession();

  if (error) throw new Error(`Erro ao obter sessão: ${error.message}`);

  return {
    accessToken: data.session?.access_token ?? null,
    refreshToken: data.session?.refresh_token ?? null,
    user: data.session?.user ?? null,
  };
}

/**
 * Listener para mudanças de estado de auth (para Fase 4)
 * Tipagem segura sem uso de `any`
 */
export function onAuthStateChange(
  callback: (event: AuthChangeEvent, session: SessionResult) => void
) {
  const { data } = supabase.auth.onAuthStateChange((event, session) => {
    callback(event, {
      accessToken: session?.access_token ?? null,
      refreshToken: session?.refresh_token ?? null,
      user: session?.user ?? null,
    });
  });

  return data.subscription;
}
