import { RefreshCw } from 'lucide-react'
import type { ActiveTab } from '../../types'

interface TopbarProps {
  activeTab: ActiveTab
  onRefresh: () => void
  saving: boolean
  busy: boolean
}

export function Topbar({ activeTab, onRefresh, saving, busy }: TopbarProps) {
  return (
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
          onClick={onRefresh}
          disabled={saving || busy}
        >
          <RefreshCw size={16} className={busy ? 'spin' : ''} />
          Atualizar
        </button>
      </div>
    </header>
  )
}
