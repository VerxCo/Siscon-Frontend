import { useMemo } from 'react';
import {
  Building2,
  CheckCircle2,
  CircleAlert,
  Link2,
  RefreshCw,
  Shield,
} from 'lucide-react';

import { TabBar } from './components/shared/TabBar';
import { useConvenioFilters } from './features/convenios/hooks/useConvenioFilters';
import { useDashboardData } from './hooks/useDashboardData';
import { useCrudModal } from './hooks/useCrudModal';
import { EntityModal } from './components/shared/EntityModal';
import { ConsignatariasTab } from './components/consignatarias/ConsignatariasTab';
import { ConveniosTab } from './components/convenios/ConveniosTab';
import { ApiClient } from './lib/api';
import { useAuth } from './contexts/AuthContext';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { PasswordRecommendationModal } from './components/auth/PasswordRecommendationModal';
import { UserMenu } from './components/user/UserMenu';
import { API_BASE_URL } from './constants';
import { filterLinkedConvenios } from './utils/filters';

function App() {
  const { user, token, showPasswordRecommendation, dismissPasswordRecommendation } = useAuth();
  const authedApi = useMemo(() => new ApiClient(API_BASE_URL, token || undefined), [token]);

  const {
    data, loadData, busy, error, setError,
    activeTab, setActiveTab,
    selectedConsignatariaId, setSelectedConsignatariaId,
    consignatariaSearch, setConsignatariaSearch,
    canWrite,
    consortiumViews, filteredConsignatarias,
    selectedConsignataria,
    openConsignatariaTab, refreshCurrent,
  } = useDashboardData(authedApi, user);

  const { filters: convenioFilters, handleFilterChange, resetFilters: resetConvenioFilters } = useConvenioFilters();
  const { modal, setModal, saving, notice, openCreate, openEdit, handleDelete, handleSave } = useCrudModal(
    authedApi, loadData, setError,
  );

  const filteredLinkedConvenios = useMemo(() => {
    const linked = selectedConsignataria?.linkedConvenios ?? [];
    return filterLinkedConvenios(linked, convenioFilters);
  }, [convenioFilters, selectedConsignataria]);

  return (
    <ProtectedRoute>
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
            <UserMenu />
          </div>
        </aside>

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

        {modal && (
          <EntityModal
            modal={modal}
            busy={saving}
            onClose={() => setModal(null)}
            onSave={handleSave}
          />
        )}

      </div>

      {showPasswordRecommendation && (
        <PasswordRecommendationModal
          onDismiss={dismissPasswordRecommendation}
        />
      )}

    </ProtectedRoute>
  );
}

export default App;
