import { Building2, Link2 } from 'lucide-react'
import type { ActiveTab } from '../../../types'

export function TabBar({
  activeTab,
  onChange,
}: {
  activeTab: ActiveTab
  onChange: (tab: ActiveTab) => void
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
  )
}
