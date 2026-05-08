import type { EntityKind, FormValues } from '../types'

export function getKindLabel(kind: EntityKind): string {
  if (kind === 'consignatarias') return 'Consignatarias'
  if (kind === 'convenios') return 'Convenios'
  return 'Vinculos'
}

export function mergeFormValues(base: FormValues, extra: Partial<FormValues>): FormValues {
  const next: FormValues = { ...base }
  for (const [key, value] of Object.entries(extra)) {
    if (value !== undefined) {
      next[key] = value
    }
  }
  return next
}
