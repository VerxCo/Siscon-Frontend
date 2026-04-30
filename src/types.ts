export type UserRole = 'admin' | 'editor' | 'viewer';

export interface AuthUser {
  user_id: string;
  role: UserRole;
  is_active: boolean;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user_id: string;
  nome: string;
  role: UserRole;
}

export interface LoginRequest {
  email: string;
  senha: string;
}

export interface ApiErrorPayload {
  detail?: string;
  message?: string;
}

export interface ConsignatariaListItem {
  id: number;
  nome: string;
  ativo: boolean;
}

export interface ConsignatariaDetail extends ConsignatariaListItem {
  criado_em?: string | null;
  atualizado_em?: string | null;
}

export interface ConvenioListItem {
  id: number;
  nome: string;
  nome_normalizado: string;
  ativo: boolean;
}

export interface ConvenioDetail extends ConvenioListItem {
  criado_em?: string | null;
  atualizado_em?: string | null;
}

export interface VinculoListItem {
  id: number;
  convenio_id: number;
  consignataria_id: number;
  produto_nome?: string | null;
  status_acesso?: string | null;
  qtd_servidores?: number | null;
  cnpj?: string | null;
  possui_base?: boolean | null;
  possui_portal?: boolean | null;
  link_portal?: string | null;
  data_solicitacao?: string | null;
  possui_robo?: boolean | null;
  faz_na_amigoz?: boolean | null;
  margem_online?: boolean | null;
  fonte_aba?: string | null;
  fonte_linha?: number | null;
  ativo: boolean;
}

export interface VinculoDetail {
  id: number;
  convenio_id: number;
  consignataria_id: number;
  produto_nome?: string | null;
  qtd_servidores?: number | null;
  cnpj?: string | null;
  possui_base?: boolean | null;
  possui_portal?: boolean | null;
  link_portal?: string | null;
  status_acesso?: string | null;
  status_acesso_id?: number | null;
  data_solicitacao?: string | null;
  possui_robo?: boolean | null;
  faz_na_amigoz?: boolean | null;
  margem_online?: boolean | null;
  fonte_aba?: string | null;
  fonte_linha?: number | null;
  observacao?: string | null;
  ativo: boolean;
}

export type EntityKind = 'consignatarias' | 'convenios' | 'vinculos';

export type FieldType = 'text' | 'number' | 'boolean' | 'date' | 'textarea' | 'select';

export interface FieldOption {
  label: string;
  value: string;
}

export interface FieldSpec {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  help?: string;
  rows?: number;
  step?: string;
  options?: FieldOption[];
}
