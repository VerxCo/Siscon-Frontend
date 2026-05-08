import { useState, useEffect, useMemo, useCallback } from 'react'
import type { ConsignatariaListItem, ConvenioListItem, VinculoListItem, ConsignatariaView, ActiveTab } from '../types'
import { ApiClient, ApiError } from '../lib/api'
import { buildConsignatariaViews, filterLinkedConvenios } from '../utils/filters'
import type { ConvenioFilters } from '../types'

interface DataState {
  consignatarias: ConsignatariaListItem[]
  convenios: ConvenioListItem[]
  vinculos: VinculoListItem[]
}

export function useDashboardData(authedApi: ApiClient, user: { role: string } | null) {
  const [data, setData] = useState<DataState>({ consignatarias: [], convenios: [], vinculos: [] })
  const [activeTab, setActiveTab] = useState<ActiveTab>('consignatarias')
  const [selectedConsignatariaId, setSelectedConsignatariaId] = useState<number | null>(null)
  const [consignatariaSearch, setConsignatariaSearch] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadData = useCallback(async (client: ApiClient) => {
    const [consignatarias, convenios, vinculos] = await Promise.allSettled([
      client.listConsignatarias(),
      client.listConvenios(),
      client.listVinculos(),
    ])

    setData({
      consignatarias: consignatarias.status === 'fulfilled' ? consignatarias.value : [],
      convenios: convenios.status === 'fulfilled' ? convenios.value : [],
      vinculos: vinculos.status === 'fulfilled' ? vinculos.value : [],
    })

    const errors: string[] = []
    if (consignatarias.status === 'rejected') errors.push('consignatarias')
    if (convenios.status === 'rejected') errors.push('convenios')
    if (vinculos.status === 'rejected') errors.push('vinculos')
    if (errors.length > 0) setError(`Falha ao carregar: ${errors.join(', ')}.`)
  }, [])

  useEffect(() => {
    if (!user) {
      setData({ consignatarias: [], convenios: [], vinculos: [] })
      setActiveTab('consignatarias')
      setSelectedConsignatariaId(null)
      return
    }

    let cancelled = false

    const boot = async () => {
      setBusy(true)
      setError(null)
      try {
        await loadData(authedApi)
      } catch (err) {
        if (cancelled) return
        if (err instanceof ApiError) setError(err.message)
        else if (err instanceof Error) setError(err.message)
        else setError('Falha de autenticacao.')
      } finally {
        if (!cancelled) setBusy(false)
      }
    }

    void boot()
    return () => { cancelled = true }
  }, [authedApi, loadData, user])

  const canWrite = user?.role === 'admin' || user?.role === 'editor'

  const consortiumViews = useMemo(
    () => buildConsignatariaViews(data.consignatarias, data.convenios, data.vinculos),
    [data.consignatarias, data.convenios, data.vinculos],
  )

  const filteredConsignatarias = useMemo(() => {
    const query = consignatariaSearch.trim().toLowerCase()
    if (!query) return consortiumViews
    return consortiumViews.filter((item) => item.nome.toLowerCase().includes(query))
  }, [consortiumViews, consignatariaSearch])

  useEffect(() => {
    if (consortiumViews.length === 0) {
      setSelectedConsignatariaId(null)
      return
    }
    if (selectedConsignatariaId == null || !consortiumViews.some((item) => item.id === selectedConsignatariaId)) {
      setSelectedConsignatariaId(consortiumViews[0].id)
    }
  }, [consortiumViews, selectedConsignatariaId])

  const selectedConsignataria = useMemo(
    () => consortiumViews.find((item) => item.id === selectedConsignatariaId) ?? null,
    [consortiumViews, selectedConsignatariaId],
  )

  const selectedLinkedConvenios = selectedConsignataria?.linkedConvenios ?? []

  function openConsignatariaTab(consignatariaId: number) {
    setSelectedConsignatariaId(consignatariaId)
    setActiveTab('convenios')
  }

  function refreshCurrent() {
    void loadData(authedApi)
  }

  return {
    data,
    loadData,
    busy,
    error,
    setError,
    activeTab,
    setActiveTab,
    selectedConsignatariaId,
    setSelectedConsignatariaId,
    consignatariaSearch,
    setConsignatariaSearch,
    canWrite,
    consortiumViews,
    filteredConsignatarias,
    selectedConsignataria,
    selectedLinkedConvenios,
    openConsignatariaTab,
    refreshCurrent,
  }
}
