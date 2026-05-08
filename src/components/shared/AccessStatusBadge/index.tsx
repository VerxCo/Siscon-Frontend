export function AccessStatusBadge({ status }: { status: string }) {
  const normalized = status.toUpperCase().replace(/_/g, ' ')
  const className =
    normalized === 'ATIVO'
      ? 'access-status access-active'
      : normalized === 'RECUSADO'
        ? 'access-status access-rejected'
        : normalized === 'SOLICITAR'
          ? 'access-status access-request'
          : normalized === 'SOLICITADO'
            ? 'access-status access-requested'
            : normalized === 'EM ANDAMENTO'
              ? 'access-status access-progress'
              : 'access-status'

  return <span className={className}>{normalized}</span>
}
