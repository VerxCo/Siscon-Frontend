import type { TriState } from '../../../types'

export function TriStateField({
  label,
  value,
  onChange,
}: {
  label: string
  value: TriState
  onChange: (value: TriState) => void
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
  )
}
