import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Building2,
  CheckCircle2,
  CircleAlert,
  Link2,
  RefreshCw,
  Shield,
} from 'lucide-react';

import { TabBar } from './components/shared/TabBar';
import { EntityModal } from './components/shared/EntityModal';
import { ConsignatariasTab } from './components/consignatarias/ConsignatariasTab';
import { ConveniosTab } from './components/convenios/ConveniosTab';
import { ApiClient, ApiError } from './lib/api';
import { getKindLabel, mergeFormValues } from './lib/utils';
import { useAuth } from './contexts/AuthContext';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { PasswordRecommendationModal } from './components/auth/PasswordRecommendationModal';
import { UserMenu } from './components/user/UserMenu';
import { API_BASE_URL } from './constants';
import type {
  ConsignatariaListItem,
  ConvenioListItem,
  VinculoListItem,
  ConsignatariaView,
  LinkedConvenioView,
  ConvenioFilters,
  EntityKind,
  FormValues,
  TriState,
  ActiveTab,
  ModalState,
} from './types';

import { DEFAULT_VALUES } from './constants/schema';

import {
  mapConsignatariaToValues,
  mapConvenioToValues,
  mapVinculoToValues,
  serializeValues,
} from './utils/mappers';

import {
  buildConsignatariaViews,
  filterLinkedConvenios,
} from './utils/filters';

interface DataState {
  consignatarias: ConsignatariaListItem[];
  convenios: ConvenioListItem[];
  vinculos: VinculoListItem[];
}

function App() {
  const { user, token, authStatus, showPasswordRecommendation, dismissPasswordRecommendation, signOut } = useAuth();
  const authedApi = useMemo(() => new ApiClient(API_BASE_URL, token || undefined), [token]);

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
    if (!user) {
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
  }, [authedApi, loadData, user]);

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

  function refreshCurrent() {
    void loadData(authedApi);
  }

 return (
  <ProtectedRoute>
    <div className="app-shell">

      {/* ================= SIDEBAR ================= */}
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
          <UserMenu />
        </div>
      </aside>

      {/* ================= MAIN ================= */}
      <main className="content">

        <header className="topbar">
          <div>
            <p className="eyebrow">Backend Siscon</p>
            <h1>
              {activeTab === 'consignatarias'
                ? 'Consignatárias'
                : 'Convênios vinculados'}
            </h1>

            <p className="muted">
              {activeTab === 'consignatarias'
                ? 'Abra uma consignatária para entrar na aba de convênios ligados.'
                : 'Use os filtros para analisar quantidade de servidores, status, portal, base e automação.'}
            </p>
          </div>

          <div className="topbar-actions">
            <button
              type="button"
              className="primary-button"
              onClick={refreshCurrent}
              disabled={saving || busy}
            >
              <RefreshCw size={16} className={busy ? 'spin' : ''} />
              Atualizar
            </button>
          </div>
        </header>

        <TabBar activeTab={activeTab} onChange={setActiveTab} />

        {/* ================= ALERTAS ================= */}
        {error && (
          <div className="banner banner-error">
            <CircleAlert size={16} />
            <span>{error}</span>
          </div>
        )}

        {notice && (
          <div className="banner banner-success">
            <CheckCircle2 size={16} />
            <span>{notice}</span>
          </div>
        )}

        {/* ================= CONTENT ================= */}
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
                selectedConsignataria
                  ? { consignataria_id: String(selectedConsignataria.id) }
                  : {},
              )
            }
            canWrite={canWrite}
            busy={saving || busy}
          />
        )}

      </main>

      {/* ================= MODAL CRUD ================= */}
      {modal && (
        <EntityModal
          modal={modal}
          busy={saving}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}

    </div>

    {/* ================= PASSWORD RECOMMENDATION (NOVO MODELO) ================= */}
    {showPasswordRecommendation && (
      <PasswordRecommendationModal
        onDismiss={dismissPasswordRecommendation}
      />
    )}

  </ProtectedRoute>
);
}

export default App;
