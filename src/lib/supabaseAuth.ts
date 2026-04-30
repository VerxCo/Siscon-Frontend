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

function getSupabaseConfig() {
  const url = import.meta.env.VITE_SUPABASE_URL?.trim();
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

  if (!url || !anonKey) {
    throw new Error('Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no Vercel.');
  }

  return {
    url: url.replace(/\/+$/, ''),
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
