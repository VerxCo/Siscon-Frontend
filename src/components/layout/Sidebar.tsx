import { Building2, Link2, Shield } from 'lucide-react'
import type { ActiveTab } from '../../types'
import { UserMenu } from '../user/UserMenu'

interface SidebarProps {
  activeTab: ActiveTab
  onTabChange: (tab: ActiveTab) => void
  consignatariaCount: number
  convenioCount: number
  vinculoCount: number
}

export function Sidebar({ activeTab, onTabChange, consignatariaCount, convenioCount, vinculoCount }: SidebarProps) {
  return (
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
          <strong>{consignatariaCount}</strong>
        </div>
        <div>
          <span>Convenios</span>
          <strong>{convenioCount}</strong>
        </div>
        <div>
          <span>Vinculos</span>
          <strong>{vinculoCount}</strong>
        </div>
      </div>

      <div className="sidebar-nav">
        <button
          type="button"
          className={`menu-item ${activeTab === 'consignatarias' ? 'active' : ''}`}
          onClick={() => onTabChange('consignatarias')}
        >
          <Building2 size={16} />
          <span>Consignatárias</span>
          <span className="menu-count">{consignatariaCount}</span>
        </button>

        <button
          type="button"
          className={`menu-item ${activeTab === 'convenios' ? 'active' : ''}`}
          onClick={() => onTabChange('convenios')}
        >
          <Link2 size={16} />
          <span>Convênios</span>
          <span className="menu-count">{vinculoCount}</span>
        </button>
      </div>

      <div className="sidebar-footer">
        <UserMenu />
      </div>
    </aside>
  )
}
