import { Shield, Building2, Link2 } from 'lucide-react'

interface SidebarProps {
  consortiumViews: any[]
  data: {
    convenios: any[]
    vinculos: any[]
  }
  activeTab: string
  setActiveTab: (tab: string) => void
}

export function Sidebar({
  consortiumViews,
  data,
  activeTab,
  setActiveTab,
}: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <Shield size={18} />
        <h2>Siscon</h2>
      </div>

      <div className="sidebar-stats">
        <div>
          <strong>{consortiumViews.length}</strong>
          <span>Consignatárias</span>
        </div>

        <div>
          <strong>{data.convenios.length}</strong>
          <span>Convênios</span>
        </div>

        <div>
          <strong>{data.vinculos.length}</strong>
          <span>Vínculos</span>
        </div>
      </div>

      <nav className="sidebar-menu">
        <button
          className={`menu-item ${activeTab === 'consignatarias' ? 'active' : ''}`}
          onClick={() => setActiveTab('consignatarias')}
        >
          <Building2 size={16} />
          <span>Consignatárias</span>
          <span className="menu-count">{consortiumViews.length}</span>
        </button>

        <button
          className={`menu-item ${activeTab === 'convenios' ? 'active' : ''}`}
          onClick={() => setActiveTab('convenios')}
        >
          <Link2 size={16} />
          <span>Convênios</span>
          <span className="menu-count">{data.vinculos.length}</span>
        </button>
      </nav>
    </aside>
  )
}