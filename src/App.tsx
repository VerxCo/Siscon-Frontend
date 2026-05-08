import { useMemo } from 'react';
import { TabBar } from './components/shared/TabBar';
import { Sidebar } from './components/layout/Sidebar';
import { Topbar } from './components/layout/Topbar';
import { Banners } from './components/layout/Banners';
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

        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          consignatariaCount={consortiumViews.length}
          convenioCount={data.convenios.length}
          vinculoCount={data.vinculos.length}
        />

        <main className="content">

          <Topbar
            activeTab={activeTab}
            onRefresh={refreshCurrent}
            saving={saving}
            busy={busy}
          />

          <TabBar activeTab={activeTab} onChange={setActiveTab} />

          <Banners error={error} notice={notice} />

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
