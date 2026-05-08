import { useState, useCallback } from 'react'
import type { ConvenioFilters, TriState } from '../../../types'

const DEFAULT_FILTERS: ConvenioFilters = {
  search: '',
  statusAcesso: '',
  minServidores: '',
  maxServidores: '',
  possuiBase: 'all',
  possuiPortal: 'all',
  possuiRobo: 'all',
  fazNaAmigoz: 'all',
  margemOnline: 'all',
  ativo: 'all',
}

export function useConvenioFilters() {
  const [filters, setFilters] = useState<ConvenioFilters>(DEFAULT_FILTERS)

  const handleFilterChange = useCallback((key: keyof ConvenioFilters, value: string | TriState) => {
    setFilters((current) => ({
      ...current,
      [key]: value,
    }))
  }, [])

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS)
  }, [])

  return {
    filters,
    handleFilterChange,
    resetFilters,
  }
}
