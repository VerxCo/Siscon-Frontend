import { Building2, Link2, PencilLine, Plus, Shield, Trash2, Users } from 'lucide-react'
import type { ConsignatariaView, ConvenioFilters, LinkedConvenioView, TriState } from '../../../types'
import { ACCESS_STATUS_OPTIONS } from '../../../constants/schema'
import { summarizeLinkedConvenios } from '../../../utils/filters'
import { MetricCard } from '../../shared/MetricCard'
import { StatusBadge } from '../../shared/StatusBadge'
import { TriStateField } from '../../shared/TriStateField'
import { AccessStatusBadge } from '../../shared/AccessStatusBadge'

export function ConveniosTab({
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
  consignatarias: ConsignatariaView[]
  selectedConsignataria: ConsignatariaView | null
  filters: ConvenioFilters
  filteredRows: LinkedConvenioView[]
  onFilterChange: (key: keyof ConvenioFilters, value: string | TriState) => void
  onResetFilters: () => void
  onSelectConsignataria: (id: number) => void
  onBack: () => void
  onEdit: (id: number) => void
  onDelete: (id: number) => void
  onCreate: () => void
  canWrite: boolean
  busy: boolean
}) {
  const metrics = summarizeLinkedConvenios(filteredRows)
  const selectedIndex = selectedConsignataria?.id ?? ''

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
  )
}
