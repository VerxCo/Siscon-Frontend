interface SupabaseTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  expires_at?: number;
  token_type: string;
  user: {
    id: string;
    email?: string | null;
  };
}

function normalizeEnvValue(name: string, value: string | undefined): string {
  const trimmed = value?.trim();
  if (!trimmed) {
    return '';
  }

  const assignmentMatch = trimmed.match(new RegExp(`^${name}\\s*=\\s*(.+)$`, 'i'));
  return assignmentMatch ? assignmentMatch[1].trim() : trimmed;
}

function getSupabaseConfig() {
  const url = normalizeEnvValue('VITE_SUPABASE_URL', import.meta.env.VITE_SUPABASE_URL);
  const anonKey = normalizeEnvValue('VITE_SUPABASE_ANON_KEY', import.meta.env.VITE_SUPABASE_ANON_KEY);

  if (!url || !anonKey) {
    throw new Error('Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no Vercel.');
  }

  let normalizedUrl = url.replace(/^\/+/, '').replace(/\/+$/, '');
  if (!/^https?:\/\//i.test(normalizedUrl)) {
    throw new Error('VITE_SUPABASE_URL precisa ser a URL base do Supabase, por exemplo https://<project>.supabase.co');
  }

  try {
    normalizedUrl = new URL(normalizedUrl).toString().replace(/\/+$/, '');
  } catch {
    throw new Error('VITE_SUPABASE_URL invalida.');
  }

  return {
    url: normalizedUrl,
    anonKey,
  };
}

function readErrorMessage(payload: unknown, fallback: string): string {
  if (payload && typeof payload === 'object') {
    if ('msg' in payload && typeof (payload as { msg?: unknown }).msg === 'string') {
      return String((payload as { msg: string }).msg);
    }

    if ('error_description' in payload && typeof (payload as { error_description?: unknown }).error_description === 'string') {
      return String((payload as { error_description: string }).error_description);
    }

    if ('message' in payload && typeof (payload as { message?: unknown }).message === 'string') {
      return String((payload as { message: string }).message);
    }
  }

  return fallback;
}

export async function signInWithSupabase(email: string, senha: string): Promise<SupabaseTokenResponse> {
  const { url, anonKey } = getSupabaseConfig();

  const response = await fetch(`${url}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      email,
      password: senha,
    }),
  });

  const raw = await response.text();
  let payload: unknown = null;
  if (raw) {
    try {
      payload = JSON.parse(raw) as unknown;
    } catch {
      payload = raw;
    }
  }

  if (!response.ok) {
    throw new Error(readErrorMessage(payload, response.statusText || 'Falha ao autenticar no Supabase.'));
  }

  if (!payload || typeof payload !== 'object' || !('access_token' in payload)) {
    throw new Error('Resposta invalida do Supabase Auth.');
  }

  return payload as SupabaseTokenResponse;
}
