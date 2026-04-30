import type {
  AuthUser,
  ConsignatariaDetail,
  ConsignatariaListItem,
  ConvenioDetail,
  ConvenioListItem,
  ApiErrorPayload,
  VinculoDetail,
  VinculoListItem,
} from '../types';

export class ApiError extends Error {
  status: number;
  payload: ApiErrorPayload | null;

  constructor(status: number, message: string, payload: ApiErrorPayload | null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.payload = payload;
  }
}

export class ApiClient {
  private readonly baseUrl: string;
  private readonly token?: string;

  constructor(baseUrl: string, token?: string) {
    this.baseUrl = baseUrl.replace(/\/+$/, '');
    this.token = token;
  }

  private url(path: string): string {
    if (!this.baseUrl) {
      return path;
    }

    return `${this.baseUrl}${path}`;
  }

  private async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const headers = new Headers(init.headers);
    headers.set('Accept', 'application/json');

    if (this.token) {
      headers.set('Authorization', `Bearer ${this.token}`);
    }

    const response = await fetch(this.url(path), {
      ...init,
      headers,
    });

    const raw = await response.text();
    const payload = raw ? (JSON.parse(raw) as ApiErrorPayload | unknown) : null;

    if (!response.ok) {
      const detail =
        payload && typeof payload === 'object' && 'detail' in payload
          ? String((payload as ApiErrorPayload).detail ?? response.statusText)
          : response.statusText;
      throw new ApiError(response.status, detail, payload && typeof payload === 'object' ? (payload as ApiErrorPayload) : null);
    }

    if (!raw) {
      return undefined as T;
    }

    return payload as T;
  }

  me(): Promise<AuthUser> {
    return this.request('/auth/me');
  }

  listConsignatarias(): Promise<ConsignatariaListItem[]> {
    return this.request('/consignatarias');
  }

  getConsignataria(id: number): Promise<ConsignatariaDetail> {
    return this.request(`/consignatarias/${id}`);
  }

  createConsignataria(payload: Record<string, unknown>): Promise<ConsignatariaDetail> {
    return this.request('/consignatarias', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
  }

  updateConsignataria(id: number, payload: Record<string, unknown>): Promise<ConsignatariaDetail> {
    return this.request(`/consignatarias/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
  }

  deleteConsignataria(id: number): Promise<unknown> {
    return this.request(`/consignatarias/${id}`, {
      method: 'DELETE',
    });
  }

  listConvenios(): Promise<ConvenioListItem[]> {
    return this.request('/convenios');
  }

  getConvenio(id: number): Promise<ConvenioDetail> {
    return this.request(`/convenios/${id}`);
  }

  createConvenio(payload: Record<string, unknown>): Promise<ConvenioDetail> {
    return this.request('/convenios', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
  }

  updateConvenio(id: number, payload: Record<string, unknown>): Promise<ConvenioDetail> {
    return this.request(`/convenios/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
  }

  deleteConvenio(id: number): Promise<unknown> {
    return this.request(`/convenios/${id}`, {
      method: 'DELETE',
    });
  }

  listVinculos(): Promise<VinculoListItem[]> {
    return this.request('/vinculos');
  }

  getVinculo(id: number): Promise<VinculoDetail> {
    return this.request(`/vinculos/${id}`);
  }

  createVinculo(payload: Record<string, unknown>): Promise<VinculoDetail> {
    return this.request('/vinculos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
  }

  updateVinculo(id: number, payload: Record<string, unknown>): Promise<VinculoDetail> {
    return this.request(`/vinculos/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
  }

  deleteVinculo(id: number): Promise<unknown> {
    return this.request(`/vinculos/${id}`, {
      method: 'DELETE',
    });
  }
}
