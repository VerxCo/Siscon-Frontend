import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  Building2,
  CheckCircle2,
  CircleAlert,
  Link2,
  LoaderCircle,
  LogOut,
  PencilLine,
  Plus,
  RefreshCw,
  Search,
  Shield,
  Trash2,
  X,
  Users,
  type LucideIcon,
} from 'lucide-react';

import { ApiClient, ApiError } from './lib/api';
import type {
  AuthUser,
  ConsignatariaDetail,
  ConsignatariaListItem,
  ConvenioDetail,
  ConvenioListItem,
  EntityKind,
  FieldSpec,
  LoginRequest,
  LoginResponse,
  VinculoDetail,
  VinculoListItem,
} from './types';

type ModalMode = 'create' | 'edit';
type FormValues = Record<string, string | boolean>;
type ActiveTab = 'consignatarias' | 'convenios';
type TriState = 'all' | 'yes' | 'no';

interface ModalState {
  kind: EntityKind;
  mode: ModalMode;
  id?: number;
  title: string;
  values: FormValues;
}

interface DataState {
  consignatarias: ConsignatariaListItem[];
  convenios: ConvenioListItem[];
  vinculos: VinculoListItem[];
}

interface LinkedConvenioView {
  vinculoId: number;
  convenioId: number;
  convenioNome: string;
  convenioNormalizado: string;
  qtdServidores: number | null;
  cnpj: string;
  possuiBase: boolean;
  fonteBase: string;
  fonteLinha: number | null;
  linkPortal: string;
  possuiRobo: boolean;
  statusAcesso: string;
  fazNaAmigoz: boolean;
  margemOnline: boolean;
  possuiPortal: boolean;
  dataSolicitacao: string;
  ativo: boolean;
}

interface ConsignatariaView extends ConsignatariaListItem {
  linkedConvenios: LinkedConvenioView[];
}

interface ConvenioFilters {
  search: string;
  statusAcesso: string;
  minServidores: string;
  maxServidores: string;
  possuiBase: TriState;
  possuiPortal: TriState;
  possuiRobo: TriState;
  fazNaAmigoz: TriState;
  margemOnline: TriState;
  ativo: TriState;
}

const TOKEN_KEY = 'siscon.front.token';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.trim() || 'http://127.0.0.1:8000';
const ACCESS_STATUS_OPTIONS = [
  { value: '', label: 'Todos os status' },
  { value: 'ATIVO', label: 'ATIVO' },
  { value: 'SOLICITAR', label: 'SOLICITAR' },
  { value: 'SOLICITADO', label: 'SOLICITADO' },
  { value: 'EM_ANDAMENTO', label: 'EM ANDAMENTO' },
  { value: 'RECUSADO', label: 'RECUSADO' },
];

const STATUS_ACESSO_OPTIONS = [
  { value: '1', label: 'ATIVO' },
  { value: '2', label: 'SOLICITAR' },
  { value: '3', label: 'SOLICITADO' },
  { value: '4', label: 'EM ANDAMENTO' },
  { value: '5', label: 'RECUSADO' },
];

const FIELD_SPECS: Record<EntityKind, FieldSpec[]> = {
  consignatarias: [
    { key: 'nome', label: 'Nome', type: 'text', required: true, placeholder: 'Consignataria' },
    { key: 'ativo', label: 'Ativo', type: 'boolean' },
  ],
  convenios: [
    { key: 'nome', label: 'Nome', type: 'text', required: true, placeholder: 'Convenio' },
    {
      key: 'nome_normalizado',
      label: 'Nome normalizado',
      type: 'text',
      required: true,
      placeholder: 'convenio-normalizado',
      help: 'Se vazio, o sistema gera um valor padrao.',
    },
    { key: 'ativo', label: 'Ativo', type: 'boolean' },
  ],
  vinculos: [
    { key: 'convenio_id', label: 'Convenio ID', type: 'number', required: true, step: '1' },
    {
      key: 'consignataria_id',
      label: 'Consignataria ID',
      type: 'number',
      required: true,
      step: '1',
    },
    { key: 'produto_nome', label: 'Produto', type: 'text', placeholder: 'Produto' },
    { key: 'qtd_servidores', label: 'Qtd. servidores', type: 'number', step: '1' },
    { key: 'cnpj', label: 'CNPJ', type: 'text', placeholder: '00.000.000/0000-00' },
    { key: 'possui_base', label: 'Possui base', type: 'boolean' },
    { key: 'possui_portal', label: 'Possui portal', type: 'boolean' },
    { key: 'fonte_aba', label: 'Origem da base - Aba', type: 'text', placeholder: 'Aba da planilha' },
    { key: 'fonte_linha', label: 'Origem da base - Linha', type: 'number', step: '1' },
    { key: 'link_portal', label: 'Acesso ao Portal', type: 'text', placeholder: 'https://...' },
    {
      key: 'status_acesso_id',
      label: 'ACESSO PORTAL',
      type: 'select',
      options: STATUS_ACESSO_OPTIONS,
      help: 'Estados reais da tabela status_acesso.',
    },
    { key: 'data_solicitacao', label: 'Data solicitacao', type: 'date' },
    { key: 'possui_robo', label: 'Possui robo', type: 'boolean' },
    { key: 'faz_na_amigoz', label: 'Faz na amigoz', type: 'boolean' },
    { key: 'margem_online', label: 'Margem online', type: 'boolean' },
    { key: 'observacao', label: 'Observacao', type: 'textarea', rows: 4 },
    { key: 'ativo', label: 'Ativo', type: 'boolean' },
  ],
};

const DEFAULT_VALUES: Record<EntityKind, FormValues> = {
  consignatarias: { nome: '', ativo: true },
  convenios: { nome: '', nome_normalizado: '', ativo: true },
  vinculos: {
    convenio_id: '',
    consignataria_id: '',
    produto_nome: '',
    qtd_servidores: '',
    cnpj: '',
    possui_base: false,
    possui_portal: false,
    fonte_aba: '',
    fonte_linha: '',
    link_portal: '',
    status_acesso_id: '',
    data_solicitacao: '',
    possui_robo: false,
    faz_na_amigoz: false,
    margem_online: false,
    observacao: '',
    ativo: true,
  },
};

function App() {
  const publicApi = useMemo(() => new ApiClient(API_BASE_URL), []);
  const [token, setToken] = useState<string>(() => localStorage.getItem(TOKEN_KEY) ?? '');
  const authedApi = useMemo(() => new ApiClient(API_BASE_URL, token || undefined), [token]);

  const [bootstrapped, setBootstrapped] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loginForm, setLoginForm] = useState<LoginRequest>({ email: '', senha: '' });
  const [data, setData] = useState<DataState>({
    consignatarias: [],
    convenios: [],
    vinculos: [],
  });
  const [activeTab, setActiveTab] = useState<ActiveTab>('consignatarias');
  const [selectedConsignatariaId, setSelectedConsignatariaId] = useState<number | null>(null);
  const [consignatariaSearch, setConsignatariaSearch] = useState('');
  const [convenioFilters, setConvenioFilters] = useState<ConvenioFilters>({
    search: '',
    statusAcesso: '',
    minServidores: '',
    maxServidores: '',
    possuiBase: 'all',
    possuiPortal: 'all',
    possuiRobo: 'all',
    fazNaAmigoz: 'all',
    margemOnline: 'all',
    ativo: 'all',
  });
  const [modal, setModal] = useState<ModalState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setBootstrapped(true);
  }, []);

  useEffect(() => {
    if (!bootstrapped) {
      return;
    }

    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  }, [bootstrapped, token]);

  const loadData = useCallback(async (client: ApiClient) => {
    const [consignatarias, convenios, vinculos] = await Promise.allSettled([
      client.listConsignatarias(),
      client.listConvenios(),
      client.listVinculos(),
    ]);

    const nextData: DataState = {
      consignatarias: consignatarias.status === 'fulfilled' ? consignatarias.value : [],
      convenios: convenios.status === 'fulfilled' ? convenios.value : [],
      vinculos: vinculos.status === 'fulfilled' ? vinculos.value : [],
    };

    setData(nextData);

    const errors: string[] = [];
    if (consignatarias.status === 'rejected') errors.push('consignatarias');
    if (convenios.status === 'rejected') errors.push('convenios');
    if (vinculos.status === 'rejected') errors.push('vinculos');

    if (errors.length > 0) {
      setError(`Falha ao carregar: ${errors.join(', ')}.`);
    }
  }, []);

  useEffect(() => {
    if (!bootstrapped) {
      return;
    }

    if (!token) {
      setUser(null);
      setData({
        consignatarias: [],
        convenios: [],
        vinculos: [],
      });
      setActiveTab('consignatarias');
      setSelectedConsignatariaId(null);
      return;
    }

    let cancelled = false;

    const boot = async () => {
      setBusy(true);
      setError(null);
      try {
        const me = await authedApi.me();
        if (cancelled) {
          return;
        }

        setUser(me);
        await loadData(authedApi);
      } catch (err) {
        if (cancelled) {
          return;
        }

        handleAuthError(err);
      } finally {
        if (!cancelled) {
          setBusy(false);
        }
      }
    };

    void boot();

    return () => {
      cancelled = true;
    };
  }, [authedApi, bootstrapped, loadData, token]);

  const canWrite = user?.role === 'admin' || user?.role === 'editor';

  const consortiumViews = useMemo(
    () => buildConsignatariaViews(data.consignatarias, data.convenios, data.vinculos),
    [data.consignatarias, data.convenios, data.vinculos],
  );

  const filteredConsignatarias = useMemo(() => {
    const query = consignatariaSearch.trim().toLowerCase();
    if (!query) {
      return consortiumViews;
    }

    return consortiumViews.filter((item) => item.nome.toLowerCase().includes(query));
  }, [consortiumViews, consignatariaSearch]);

  useEffect(() => {
    if (consortiumViews.length === 0) {
      setSelectedConsignatariaId(null);
      return;
    }

    if (
      selectedConsignatariaId == null ||
      !consortiumViews.some((item) => item.id === selectedConsignatariaId)
    ) {
      setSelectedConsignatariaId(consortiumViews[0].id);
    }
  }, [consortiumViews, selectedConsignatariaId]);

  const selectedConsignataria = useMemo(
    () => consortiumViews.find((item) => item.id === selectedConsignatariaId) ?? null,
    [consortiumViews, selectedConsignatariaId],
  );

  const selectedLinkedConvenios = selectedConsignataria?.linkedConvenios ?? [];

  const filteredLinkedConvenios = useMemo(
    () => filterLinkedConvenios(selectedLinkedConvenios, convenioFilters),
    [convenioFilters, selectedLinkedConvenios],
  );

  function handleAuthError(err: unknown) {
    setToken('');
    setUser(null);

    if (err instanceof ApiError) {
      setError(err.message);
      return;
    }

    if (err instanceof Error) {
      setError(err.message);
      return;
    }

    setError('Falha de autenticacao.');
  }

  function getErrorMessage(err: unknown, fallback: string): string {
    if (err instanceof ApiError) {
      return err.message;
    }

    if (err instanceof Error) {
      return err.message;
    }

    return fallback;
  }

  function openConsignatariaTab(consignatariaId: number) {
    setSelectedConsignatariaId(consignatariaId);
    setActiveTab('convenios');
  }

  function handleFilterChange(key: keyof ConvenioFilters, value: string | TriState) {
    setConvenioFilters((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function resetConvenioFilters() {
    setConvenioFilters({
      search: '',
      statusAcesso: '',
      minServidores: '',
      maxServidores: '',
      possuiBase: 'all',
      possuiPortal: 'all',
      possuiRobo: 'all',
      fazNaAmigoz: 'all',
      margemOnline: 'all',
      ativo: 'all',
    });
  }

  function openCreate(kind: EntityKind, initialValues: Partial<FormValues> = {}) {
    setError(null);
    setModal({
      kind,
      mode: 'create',
      title: `Novo ${getKindLabel(kind)}`,
      values: mergeFormValues(DEFAULT_VALUES[kind], initialValues),
    });
  }

  async function openEdit(kind: EntityKind, id: number) {
    setSaving(true);
    setError(null);

    try {
      let values: FormValues;

      if (kind === 'consignatarias') {
        const item = await authedApi.getConsignataria(id);
        values = mapConsignatariaToValues(item);
      } else if (kind === 'convenios') {
        const item = await authedApi.getConvenio(id);
        values = mapConvenioToValues(item);
      } else {
        const item = await authedApi.getVinculo(id);
        values = mapVinculoToValues(item);
      }

      setModal({
        kind,
        mode: 'edit',
        id,
        title: `Editar ${getKindLabel(kind)}`,
        values,
      });
    } catch (err) {
      setError(getErrorMessage(err, 'Falha ao abrir registro.'));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(kind: EntityKind, id: number) {
    const label = getKindLabel(kind);
    if (!window.confirm(`Remover este ${label.toLowerCase()}?`)) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      if (kind === 'consignatarias') {
        await authedApi.deleteConsignataria(id);
      } else if (kind === 'convenios') {
        await authedApi.deleteConvenio(id);
      } else {
        await authedApi.deleteVinculo(id);
      }

      await loadData(authedApi);
      setNotice(`${label} removido com sucesso.`);
    } catch (err) {
      setError(getErrorMessage(err, 'Falha ao remover registro.'));
    } finally {
      setSaving(false);
    }
  }

  async function handleSave(values: FormValues) {
    if (!modal) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const payload = serializeValues(modal.kind, values);

      if (modal.mode === 'create') {
        if (modal.kind === 'consignatarias') {
          await authedApi.createConsignataria(payload);
        } else if (modal.kind === 'convenios') {
          await authedApi.createConvenio(payload);
        } else {
          await authedApi.createVinculo(payload);
        }
      } else if (modal.id != null) {
        if (modal.kind === 'consignatarias') {
          await authedApi.updateConsignataria(modal.id, payload);
        } else if (modal.kind === 'convenios') {
          await authedApi.updateConvenio(modal.id, payload);
        } else {
          await authedApi.updateVinculo(modal.id, payload);
        }
      }

      setModal(null);
      await loadData(authedApi);
      setNotice(`${getKindLabel(modal.kind)} salvo com sucesso.`);
    } catch (err) {
      setError(getErrorMessage(err, 'Falha ao salvar registro.'));
      throw err;
    } finally {
      setSaving(false);
    }
  }

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);

    try {
      const response: LoginResponse = await publicApi.login(loginForm);
      setToken(response.access_token);
      setUser({
        user_id: response.user_id,
        role: response.role,
        is_active: true,
      });
      setLoginForm({ email: '', senha: '' });
      setNotice('Login realizado com sucesso.');
    } catch (err) {
      setError(getErrorMessage(err, 'Falha ao autenticar.'));
    } finally {
      setBusy(false);
    }
  }

  function handleLogout() {
    setToken('');
    setUser(null);
    setData({
      consignatarias: [],
      convenios: [],
      vinculos: [],
    });
    setActiveTab('consignatarias');
    setSelectedConsignatariaId(null);
    setConsignatariaSearch('');
    resetConvenioFilters();
    setModal(null);
    setNotice('Sessao encerrada.');
  }

  function refreshCurrent() {
    void loadData(authedApi);
  }

  if (!user) {
    return (
      <LoginScreen
        busy={busy}
        error={error}
        notice={notice}
        form={loginForm}
        onChange={setLoginForm}
        onSubmit={handleLogin}
      />
    );
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">
            <Shield size={18} />
          </div>
          <div>
            <strong>Siscon</strong>
            <span>consignatarias e convenios</span>
          </div>
        </div>

        <div className="sidebar-summary">
          <div>
            <span>Consignatarias</span>
            <strong>{consortiumViews.length}</strong>
          </div>
          <div>
            <span>Convenios</span>
            <strong>{data.convenios.length}</strong>
          </div>
          <div>
            <span>Vinculos</span>
            <strong>{data.vinculos.length}</strong>
          </div>
        </div>

        <div className="sidebar-nav">
          <button
            type="button"
            className={`menu-item ${activeTab === 'consignatarias' ? 'active' : ''}`}
            onClick={() => setActiveTab('consignatarias')}
          >
            <Building2 size={16} />
            <span>Consignatárias</span>
            <span className="menu-count">{consortiumViews.length}</span>
          </button>
          <button
            type="button"
            className={`menu-item ${activeTab === 'convenios' ? 'active' : ''}`}
            onClick={() => setActiveTab('convenios')}
          >
            <Link2 size={16} />
            <span>Convênios</span>
            <span className="menu-count">{data.vinculos.length}</span>
          </button>
        </div>

        <div className="sidebar-footer">
          <div className="session-card">
            <span className="session-label">Usuario</span>
            <strong>{user.user_id}</strong>
            <span className="session-meta">{user.role}</span>
          </div>

          <button type="button" className="ghost-button" onClick={handleLogout}>
            <LogOut size={16} />
            Sair
          </button>
        </div>
      </aside>

      <main className="content">
        <header className="topbar">
          <div>
            <p className="eyebrow">Backend Siscon</p>
            <h1>{activeTab === 'consignatarias' ? 'Consignatárias' : 'Convênios vinculados'}</h1>
            <p className="muted">
              {activeTab === 'consignatarias'
                ? 'Abra uma consignatária para entrar na aba de convênios ligados.'
                : 'Use os filtros para analisar quantidade de servidores, status, portal, base e automação.'}
            </p>
          </div>

          <div className="topbar-actions">
            <button type="button" className="primary-button" onClick={refreshCurrent} disabled={saving || busy}>
              <RefreshCw size={16} className={busy ? 'spin' : ''} />
              Atualizar
            </button>
          </div>
        </header>

        <TabBar activeTab={activeTab} onChange={setActiveTab} />

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

        {activeTab === 'consignatarias' ? (
          <ConsignatariasTab
            rows={filteredConsignatarias}
            search={consignatariaSearch}
            onSearchChange={setConsignatariaSearch}
            onOpenConvenios={openConsignatariaTab}
            onEdit={(id) => void openEdit('consignatarias', id)}
            onDelete={(id) => void handleDelete('consignatarias', id)}
            onCreate={() => openCreate('consignatarias')}
            canWrite={canWrite}
            busy={saving || busy}
          />
        ) : (
          <ConveniosTab
            consignatarias={consortiumViews}
            selectedConsignataria={selectedConsignataria}
            filters={convenioFilters}
            filteredRows={filteredLinkedConvenios}
            onFilterChange={handleFilterChange}
            onResetFilters={resetConvenioFilters}
            onSelectConsignataria={setSelectedConsignatariaId}
            onBack={() => setActiveTab('consignatarias')}
            onEdit={(id) => void openEdit('vinculos', id)}
            onDelete={(id) => void handleDelete('vinculos', id)}
            onCreate={() =>
              openCreate(
                'vinculos',
                selectedConsignataria ? { consignataria_id: String(selectedConsignataria.id) } : {},
              )
            }
            canWrite={canWrite}
            busy={saving || busy}
          />
        )}
      </main>

      {modal ? (
        <EntityModal modal={modal} busy={saving} onClose={() => setModal(null)} onSave={handleSave} />
      ) : null}
    </div>
  );
}

function LoginScreen({
  busy,
  error,
  notice,
  form,
  onChange,
  onSubmit,
}: {
  busy: boolean;
  error: string | null;
  notice: string | null;
  form: LoginRequest;
  onChange: (value: LoginRequest) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <main className="login-screen">
      <section className="login-panel">
        <div className="login-brand">
          <Shield size={18} />
          <span>Siscon</span>
        </div>

        <h1>Acesso ao painel</h1>
        <p className="muted">Autenticacao via backend atual do projeto.</p>

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

        <form className="login-form" onSubmit={onSubmit}>
          <label className="field">
            <span>Email</span>
            <input
              type="email"
              value={form.email}
              onChange={(event) => onChange({ ...form, email: event.target.value })}
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
              onChange={(event) => onChange({ ...form, senha: event.target.value })}
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

function TabBar({
  activeTab,
  onChange,
}: {
  activeTab: ActiveTab;
  onChange: (tab: ActiveTab) => void;
}) {
  return (
    <div className="tab-bar">
      <button
        type="button"
        className={`tab-button ${activeTab === 'consignatarias' ? 'active' : ''}`}
        onClick={() => onChange('consignatarias')}
      >
        <Building2 size={16} />
        Consignatárias
      </button>
      <button
        type="button"
        className={`tab-button ${activeTab === 'convenios' ? 'active' : ''}`}
        onClick={() => onChange('convenios')}
      >
        <Link2 size={16} />
        Convênios
      </button>
    </div>
  );
}

function ConsignatariasTab({
  rows,
  search,
  onSearchChange,
  onOpenConvenios,
  onEdit,
  onDelete,
  onCreate,
  canWrite,
  busy,
}: {
  rows: ConsignatariaView[];
  search: string;
  onSearchChange: (value: string) => void;
  onOpenConvenios: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onCreate: () => void;
  canWrite: boolean;
  busy: boolean;
}) {
  const totalServidores = rows.reduce(
    (sum, consignataria) =>
      sum +
      consignataria.linkedConvenios.reduce(
        (linkedSum, item) => linkedSum + (item.qtdServidores ?? 0),
        0,
      ),
    0,
  );

  const totalVinculos = rows.reduce((sum, consignataria) => sum + consignataria.linkedConvenios.length, 0);
  const consignatariasAtivas = rows.filter((item) => item.ativo).length;

  return (
    <section className="tab-panel">
      <div className="stat-strip">
        <MetricCard title="Consignatarias" value={rows.length} icon={Building2} />
        <MetricCard title="Ativas" value={consignatariasAtivas} icon={Shield} />
        <MetricCard title="Vínculos" value={totalVinculos} icon={Link2} />
        <MetricCard title="Servidores" value={totalServidores} icon={Users} />
      </div>

      <div className="panel tool-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Lista de consignatárias</p>
            <h2>Selecione uma consignatária para abrir os convênios ligados</h2>
          </div>
          {canWrite ? (
            <button type="button" className="secondary-button" onClick={onCreate} disabled={busy}>
              <Plus size={16} />
              Nova consignatária
            </button>
          ) : null}
        </div>

        <label className="search-field compact">
          <span>
            <Search size={14} />
            Buscar consignatária
          </span>
          <input
            type="text"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Filtrar por nome"
          />
        </label>

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Convênios</th>
                <th>Ativos</th>
                <th>Servidores</th>
                <th>Ativo</th>
                <th className="actions-column">Ações</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((item) => {
                const linkedCount = item.linkedConvenios.length;
                const activeLinkedCount = item.linkedConvenios.filter((linked) => linked.ativo).length;
                const servers = item.linkedConvenios.reduce((sum, linked) => sum + (linked.qtdServidores ?? 0), 0);

                return (
                  <tr key={item.id}>
                    <td>
                      <div className="table-stack">
                        <strong>{item.nome}</strong>
                        <span>ID {item.id}</span>
                      </div>
                    </td>
                    <td>{linkedCount}</td>
                    <td>{activeLinkedCount}</td>
                    <td>{servers}</td>
                    <td>
                      <StatusBadge active={item.ativo} />
                    </td>
                    <td>
                      <div className="row-actions">
                        <button
                          type="button"
                          className="secondary-button"
                          onClick={() => onOpenConvenios(item.id)}
                        >
                          Abrir convênios
                        </button>
                        {canWrite ? (
                          <>
                            <button
                              type="button"
                              className="icon-button"
                              onClick={() => onEdit(item.id)}
                              aria-label="Editar consignatária"
                              disabled={busy}
                            >
                              <PencilLine size={16} />
                            </button>
                            <button
                              type="button"
                              className="icon-button danger"
                              onClick={() => onDelete(item.id)}
                              aria-label="Excluir consignatária"
                              disabled={busy}
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function ConveniosTab({
  consignatarias,
  selectedConsignataria,
  filters,
  filteredRows,
  onFilterChange,
  onResetFilters,
  onSelectConsignataria,
  onBack,
  onEdit,
  onDelete,
  onCreate,
  canWrite,
  busy,
}: {
  consignatarias: ConsignatariaView[];
  selectedConsignataria: ConsignatariaView | null;
  filters: ConvenioFilters;
  filteredRows: LinkedConvenioView[];
  onFilterChange: (key: keyof ConvenioFilters, value: string | TriState) => void;
  onResetFilters: () => void;
  onSelectConsignataria: (id: number) => void;
  onBack: () => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onCreate: () => void;
  canWrite: boolean;
  busy: boolean;
}) {
  const metrics = summarizeLinkedConvenios(filteredRows);
  const selectedIndex = selectedConsignataria?.id ?? '';

  return (
    <section className="tab-panel">
      <div className="panel tool-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Convênios por consignatária</p>
            <h2>{selectedConsignataria?.nome ?? 'Nenhuma consignatária selecionada'}</h2>
          </div>

          <div className="panel-actions">
            <button type="button" className="secondary-button" onClick={onBack}>
              <Building2 size={16} />
              Ver consignatárias
            </button>
            {canWrite ? (
              <button type="button" className="secondary-button" onClick={onCreate} disabled={busy || !selectedConsignataria}>
                <Plus size={16} />
                Novo vínculo
              </button>
            ) : null}
          </div>
        </div>

        <div className="filter-grid">
          <label className="field">
            <span>Consignatária</span>
            <select
              value={String(selectedIndex)}
              onChange={(event) => onSelectConsignataria(Number(event.target.value))}
            >
              {consignatarias.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.nome}
                </option>
              ))}
            </select>
          </label>

          <label className="field field-wide">
            <span>Buscar nos convênios</span>
            <input
              type="text"
              value={filters.search}
              onChange={(event) => onFilterChange('search', event.target.value)}
              placeholder="Convênio, CNPJ, origem, portal, produto"
            />
          </label>

          <label className="field">
            <span>Status acesso</span>
            <select
              value={filters.statusAcesso}
              onChange={(event) => onFilterChange('statusAcesso', event.target.value)}
            >
              {ACCESS_STATUS_OPTIONS.map((option) => (
                <option key={option.value || 'all'} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Min. servidores</span>
            <input
              type="number"
              value={filters.minServidores}
              onChange={(event) => onFilterChange('minServidores', event.target.value)}
              placeholder="0"
            />
          </label>

          <label className="field">
            <span>Max. servidores</span>
            <input
              type="number"
              value={filters.maxServidores}
              onChange={(event) => onFilterChange('maxServidores', event.target.value)}
              placeholder="100"
            />
          </label>

          <TriStateField label="Possui base" value={filters.possuiBase} onChange={(value) => onFilterChange('possuiBase', value)} />
          <TriStateField label="Possui portal" value={filters.possuiPortal} onChange={(value) => onFilterChange('possuiPortal', value)} />
          <TriStateField label="Robo" value={filters.possuiRobo} onChange={(value) => onFilterChange('possuiRobo', value)} />
          <TriStateField label="Faz na AMIGOZ" value={filters.fazNaAmigoz} onChange={(value) => onFilterChange('fazNaAmigoz', value)} />
          <TriStateField label="Margem online" value={filters.margemOnline} onChange={(value) => onFilterChange('margemOnline', value)} />
          <TriStateField label="Ativo" value={filters.ativo} onChange={(value) => onFilterChange('ativo', value)} />

          <div className="filter-actions">
            <button type="button" className="secondary-button" onClick={onResetFilters}>
              Limpar filtros
            </button>
          </div>
        </div>
      </div>

      <div className="stat-strip">
        <MetricCard title="Convênios visíveis" value={metrics.total} icon={Link2} />
        <MetricCard title="Servidores" value={metrics.servers} icon={Users} />
        <MetricCard title="Com base" value={metrics.withBase} icon={Building2} />
        <MetricCard title="Com portal" value={metrics.withPortal} icon={Shield} />
      </div>

      <div className="panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Tabela estratégica</p>
            <h2>{filteredRows.length} registros após filtros</h2>
          </div>
        </div>

        {selectedConsignataria && filteredRows.length > 0 ? (
          <div className="table-wrap">
            <table className="data-table vinculo-table">
              <thead>
                <tr>
                  <th>Convênio</th>
                  <th>Qtd</th>
                  <th>CNPJ</th>
                  <th>Base</th>
                  <th>Origem da Base</th>
                  <th>Portal</th>
                  <th>Robo</th>
                  <th>Status</th>
                  <th>AMIGOZ</th>
                  <th>Margem</th>
                  <th>Possui Portal</th>
                  <th>Solicitação</th>
                  <th>Ativo</th>
                  <th className="actions-column">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((item) => (
                  <tr key={item.vinculoId}>
                    <td>
                      <div className="table-stack">
                        <strong>{item.convenioNome}</strong>
                        <span>{item.convenioNormalizado}</span>
                      </div>
                    </td>
                    <td>{item.qtdServidores ?? '-'}</td>
                    <td>{item.cnpj}</td>
                    <td>
                      <StatusBadge active={item.possuiBase} />
                    </td>
                    <td>{item.fonteBase}</td>
                    <td>{item.linkPortal}</td>
                    <td>
                      <StatusBadge active={item.possuiRobo} />
                    </td>
                    <td>
                      <AccessStatusBadge status={item.statusAcesso} />
                    </td>
                    <td>
                      <StatusBadge active={item.fazNaAmigoz} />
                    </td>
                    <td>
                      <StatusBadge active={item.margemOnline} />
                    </td>
                    <td>
                      <StatusBadge active={item.possuiPortal} />
                    </td>
                    <td>{item.dataSolicitacao}</td>
                    <td>
                      <StatusBadge active={item.ativo} />
                    </td>
                    <td>
                      {canWrite ? (
                        <div className="row-actions">
                          <button
                            type="button"
                            className="icon-button"
                            onClick={() => onEdit(item.vinculoId)}
                            aria-label="Editar vinculo"
                            disabled={busy}
                          >
                            <PencilLine size={16} />
                          </button>
                          <button
                            type="button"
                            className="icon-button danger"
                            onClick={() => onDelete(item.vinculoId)}
                            aria-label="Excluir vinculo"
                            disabled={busy}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            Selecione uma consignatária e ajuste os filtros para visualizar os convênios.
          </div>
        )}
      </div>
    </section>
  );
}

function StatusBadge({ active }: { active: boolean }) {
  return <span className={`status-badge ${active ? 'status-on' : 'status-off'}`}>{active ? 'Sim' : 'Nao'}</span>;
}

function MetricCard({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: number;
  icon: LucideIcon;
}) {
  return (
    <article className="metric-card">
      <div className="metric-icon">
        <Icon size={18} />
      </div>
      <div>
        <span>{title}</span>
        <strong>{value}</strong>
      </div>
    </article>
  );
}

function TriStateField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: TriState;
  onChange: (value: TriState) => void;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value as TriState)}>
        <option value="all">Todos</option>
        <option value="yes">Sim</option>
        <option value="no">Não</option>
      </select>
    </label>
  );
}

function AccessStatusBadge({ status }: { status: string }) {
  const normalized = status.toUpperCase().replace(/_/g, ' ');
  const className =
    normalized === 'ATIVO'
      ? 'access-status access-active'
      : normalized === 'RECUSADO'
        ? 'access-status access-rejected'
        : normalized === 'SOLICITAR'
          ? 'access-status access-request'
          : normalized === 'SOLICITADO'
            ? 'access-status access-requested'
            : normalized === 'EM ANDAMENTO'
              ? 'access-status access-progress'
              : 'access-status';

  return <span className={className}>{normalized}</span>;
}

function EntityModal({
  modal,
  busy,
  onClose,
  onSave,
}: {
  modal: ModalState;
  busy: boolean;
  onClose: () => void;
  onSave: (values: FormValues) => Promise<void>;
}) {
  const [values, setValues] = useState<FormValues>(modal.values);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    setValues(modal.values);
    setLocalError(null);
  }, [modal]);

  function updateField(key: string, nextValue: string | boolean) {
    setValues((current) => ({ ...current, [key]: nextValue }));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLocalError(null);

    try {
      await onSave(values);
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Falha ao salvar.');
    }
  }

  const fields = FIELD_SPECS[modal.kind];

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div className="modal-panel" onClick={(event) => event.stopPropagation()} role="presentation">
        <div className="modal-header">
          <div>
            <p className="eyebrow">{getKindLabel(modal.kind)}</p>
            <h3>{modal.title}</h3>
          </div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Fechar">
            <X size={16} />
          </button>
        </div>

        {localError ? (
          <div className="banner banner-error">
            <CircleAlert size={16} />
            <span>{localError}</span>
          </div>
        ) : null}

        <form className="modal-form" onSubmit={submit}>
          {fields.map((field) => (
            <label key={field.key} className={`field ${field.type === 'textarea' ? 'field-wide' : ''}`}>
              <span>
                {field.label}
                {field.required ? ' *' : ''}
              </span>

              {field.type === 'boolean' ? (
                <div className="check-row">
                  <input
                    type="checkbox"
                    checked={Boolean(values[field.key])}
                    onChange={(event) => updateField(field.key, event.target.checked)}
                  />
                  <span>{Boolean(values[field.key]) ? 'Sim' : 'Nao'}</span>
                </div>
              ) : field.type === 'select' ? (
                <select
                  value={String(values[field.key] ?? '')}
                  onChange={(event) => updateField(field.key, event.target.value)}
                >
                  <option value="">Selecione</option>
                  {field.options?.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : field.type === 'textarea' ? (
                <textarea
                  rows={field.rows ?? 4}
                  value={String(values[field.key] ?? '')}
                  onChange={(event) => updateField(field.key, event.target.value)}
                  placeholder={field.placeholder}
                />
              ) : (
                <input
                  type={field.type}
                  step={field.step}
                  value={String(values[field.key] ?? '')}
                  onChange={(event) => updateField(field.key, event.target.value)}
                  placeholder={field.placeholder}
                />
              )}

              {field.help ? <small>{field.help}</small> : null}
            </label>
          ))}

          <div className="modal-actions">
            <button type="button" className="secondary-button" onClick={onClose} disabled={busy}>
              Cancelar
            </button>
            <button type="submit" className="primary-button" disabled={busy}>
              {busy ? <LoaderCircle size={16} className="spin" /> : <CheckCircle2 size={16} />}
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function getKindLabel(kind: EntityKind): string {
  if (kind === 'consignatarias') return 'Consignatarias';
  if (kind === 'convenios') return 'Convenios';
  return 'Vinculos';
}

function normalizedName(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function cleanString(value: string | boolean | undefined): string | null {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function toNumberOrNull(value: string | boolean | undefined): number | null {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseRequiredInt(value: string | boolean | undefined, label: string): number {
  const parsed = toNumberOrNull(value);
  if (parsed == null) {
    throw new Error(`${label} e obrigatorio.`);
  }

  return parsed;
}

function mapConsignatariaToValues(item: ConsignatariaDetail): FormValues {
  return {
    nome: item.nome ?? '',
    ativo: item.ativo,
  };
}

function mapConvenioToValues(item: ConvenioDetail): FormValues {
  return {
    nome: item.nome ?? '',
    nome_normalizado: item.nome_normalizado ?? '',
    ativo: item.ativo,
  };
}

function mapVinculoToValues(item: VinculoDetail): FormValues {
  return {
    convenio_id: item.convenio_id ? String(item.convenio_id) : '',
    consignataria_id: item.consignataria_id ? String(item.consignataria_id) : '',
    produto_nome: item.produto_nome ?? '',
    qtd_servidores: item.qtd_servidores != null ? String(item.qtd_servidores) : '',
    cnpj: item.cnpj ?? '',
    possui_base: Boolean(item.possui_base),
    possui_portal: Boolean(item.possui_portal),
    link_portal: item.link_portal ?? '',
    fonte_aba: item.fonte_aba ?? '',
    fonte_linha: item.fonte_linha != null ? String(item.fonte_linha) : '',
    status_acesso_id: item.status_acesso_id != null ? String(item.status_acesso_id) : '',
    data_solicitacao: item.data_solicitacao ? item.data_solicitacao.slice(0, 10) : '',
    possui_robo: Boolean(item.possui_robo),
    faz_na_amigoz: Boolean(item.faz_na_amigoz),
    margem_online: Boolean(item.margem_online),
    observacao: item.observacao ?? '',
    ativo: item.ativo,
  };
}

function serializeValues(kind: EntityKind, values: FormValues): Record<string, unknown> {
  if (kind === 'consignatarias') {
    const nome = cleanString(values.nome);
    if (!nome) {
      throw new Error('Nome e obrigatorio.');
    }

    return {
      nome,
      ativo: Boolean(values.ativo),
    };
  }

  if (kind === 'convenios') {
    const nome = cleanString(values.nome);
    if (!nome) {
      throw new Error('Nome e obrigatorio.');
    }

    const nomeNormalizado = cleanString(values.nome_normalizado) ?? normalizedName(nome);

    return {
      nome,
      nome_normalizado: nomeNormalizado,
      ativo: Boolean(values.ativo),
    };
  }

  const convenioId = parseRequiredInt(values.convenio_id, 'Convenio ID');
  const consignatariaId = parseRequiredInt(values.consignataria_id, 'Consignataria ID');

  return {
    convenio_id: convenioId,
    consignataria_id: consignatariaId,
    produto_nome: cleanString(values.produto_nome),
    qtd_servidores: toNumberOrNull(values.qtd_servidores),
    cnpj: cleanString(values.cnpj),
    possui_base: Boolean(values.possui_base),
    possui_portal: Boolean(values.possui_portal),
    link_portal: cleanString(values.link_portal),
    fonte_aba: cleanString(values.fonte_aba),
    fonte_linha: toNumberOrNull(values.fonte_linha),
    status_acesso_id: toNumberOrNull(values.status_acesso_id),
    data_solicitacao: cleanString(values.data_solicitacao),
    possui_robo: Boolean(values.possui_robo),
    faz_na_amigoz: Boolean(values.faz_na_amigoz),
    margem_online: Boolean(values.margem_online),
    observacao: cleanString(values.observacao),
    ativo: Boolean(values.ativo),
  };
}

function buildConsignatariaViews(
  consignatarias: ConsignatariaListItem[],
  convenios: ConvenioListItem[],
  vinculos: VinculoListItem[],
): ConsignatariaView[] {
  const convenioMap = new Map(convenios.map((item) => [item.id, item]));

  return consignatarias.map((consignataria) => {
    const linkedConvenios = vinculos
      .filter((item) => item.consignataria_id === consignataria.id)
      .map((item) => {
        const convenio = convenioMap.get(item.convenio_id);

        return {
          vinculoId: item.id,
          convenioId: item.convenio_id,
          convenioNome: convenio?.nome ?? `Convenio #${item.convenio_id}`,
          convenioNormalizado: convenio?.nome_normalizado ?? '-',
          qtdServidores: item.qtd_servidores ?? null,
          cnpj: item.cnpj ?? '-',
          possuiBase: Boolean(item.possui_base),
          fonteBase:
            item.fonte_aba != null || item.fonte_linha != null
              ? `${item.fonte_aba ?? '-'}${item.fonte_linha != null ? ` / ${item.fonte_linha}` : ''}`
              : '-',
          fonteLinha: item.fonte_linha ?? null,
          linkPortal: item.link_portal ?? '-',
          possuiRobo: Boolean(item.possui_robo),
          statusAcesso: item.status_acesso ?? '-',
          fazNaAmigoz: Boolean(item.faz_na_amigoz),
          margemOnline: Boolean(item.margem_online),
          possuiPortal: Boolean(item.possui_portal),
          dataSolicitacao: item.data_solicitacao ? item.data_solicitacao.slice(0, 10) : '-',
          ativo: item.ativo,
        };
      })
      .sort((left, right) => left.convenioNome.localeCompare(right.convenioNome, 'pt-BR'));

    return {
      ...consignataria,
      linkedConvenios,
    };
  });
}

function filterLinkedConvenios(rows: LinkedConvenioView[], filters: ConvenioFilters): LinkedConvenioView[] {
  const search = normalizeText(filters.search);
  const minServidores = toNumberOrNull(filters.minServidores);
  const maxServidores = toNumberOrNull(filters.maxServidores);

  return rows.filter((item) => {
    if (search) {
      const searchable = normalizeText(
        [
          item.convenioNome,
          item.convenioNormalizado,
          item.cnpj,
          item.fonteBase,
          item.linkPortal,
          item.statusAcesso,
          item.dataSolicitacao,
        ]
          .filter(Boolean)
          .join(' '),
      );

      if (!searchable.includes(search)) {
        return false;
      }
    }

    if (filters.statusAcesso && normalizeAccessStatus(item.statusAcesso) !== filters.statusAcesso) {
      return false;
    }

    if (minServidores != null && (item.qtdServidores ?? 0) < minServidores) {
      return false;
    }

    if (maxServidores != null && (item.qtdServidores ?? 0) > maxServidores) {
      return false;
    }

    if (!matchesTriState(item.possuiBase, filters.possuiBase)) return false;
    if (!matchesTriState(item.possuiPortal, filters.possuiPortal)) return false;
    if (!matchesTriState(item.possuiRobo, filters.possuiRobo)) return false;
    if (!matchesTriState(item.fazNaAmigoz, filters.fazNaAmigoz)) return false;
    if (!matchesTriState(item.margemOnline, filters.margemOnline)) return false;
    if (!matchesTriState(item.ativo, filters.ativo)) return false;

    return true;
  });
}

function summarizeConsignatarias(rows: ConsignatariaView[]) {
  const totalServidores = rows.reduce(
    (sum, consignataria) =>
      sum +
      consignataria.linkedConvenios.reduce(
        (linkedSum, item) => linkedSum + (item.qtdServidores ?? 0),
        0,
      ),
    0,
  );

  const totalVinculos = rows.reduce((sum, consignataria) => sum + consignataria.linkedConvenios.length, 0);
  const consignatariasAtivas = rows.filter((item) => item.ativo).length;

  return {
    total: rows.length,
    active: consignatariasAtivas,
    links: totalVinculos,
    servers: totalServidores,
  };
}

function summarizeLinkedConvenios(rows: LinkedConvenioView[]) {
  return {
    total: rows.length,
    servers: rows.reduce((sum, item) => sum + (item.qtdServidores ?? 0), 0),
    withBase: rows.filter((item) => item.possuiBase).length,
    withPortal: rows.filter((item) => item.possuiPortal).length,
    withRobo: rows.filter((item) => item.possuiRobo).length,
    active: rows.filter((item) => item.ativo).length,
  };
}

function matchesTriState(value: boolean, filter: TriState): boolean {
  if (filter === 'all') {
    return true;
  }

  return filter === 'yes' ? value : !value;
}

function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function normalizeAccessStatus(value: string): string {
  return value.toUpperCase().replace(/[\s-]+/g, '_');
}

function mergeFormValues(base: FormValues, extra: Partial<FormValues>): FormValues {
  const next: FormValues = { ...base };

  for (const [key, value] of Object.entries(extra)) {
    if (value !== undefined) {
      next[key] = value;
    }
  }

  return next;
}

export default App;
