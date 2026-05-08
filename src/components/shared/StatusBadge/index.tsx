export function StatusBadge({ active }: { active: boolean }) {
  return <span className={`status-badge ${active ? 'status-on' : 'status-off'}`}>{active ? 'Sim' : 'Nao'}</span>
}
