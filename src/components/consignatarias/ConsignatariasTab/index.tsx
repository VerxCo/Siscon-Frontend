import { Building2, Link2, PencilLine, Plus, Search, Shield, Trash2, Users } from 'lucide-react'
import type { ConsignatariaView } from '../../../types'
import { MetricCard } from '../../shared/MetricCard'
import { StatusBadge } from '../../shared/StatusBadge'

export function ConsignatariasTab({
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
  rows: ConsignatariaView[]
  search: string
  onSearchChange: (value: string) => void
  onOpenConvenios: (id: number) => void
  onEdit: (id: number) => void
  onDelete: (id: number) => void
  onCreate: () => void
  canWrite: boolean
  busy: boolean
}) {
  const totalServidores = rows.reduce(
    (sum, consignataria) =>
      sum +
      consignataria.linkedConvenios.reduce(
        (linkedSum, item) => linkedSum + (item.qtdServidores ?? 0),
        0,
      ),
    0,
  )

  const totalVinculos = rows.reduce((sum, consignataria) => sum + consignataria.linkedConvenios.length, 0)
  const consignatariasAtivas = rows.filter((item) => item.ativo).length

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
                const linkedCount = item.linkedConvenios.length
                const activeLinkedCount = item.linkedConvenios.filter((linked) => linked.ativo).length
                const servers = item.linkedConvenios.reduce((sum, linked) => sum + (linked.qtdServidores ?? 0), 0)

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
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
