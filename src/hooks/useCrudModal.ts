import { useState } from 'react'
import { ApiClient, ApiError } from '../lib/api'
import { getKindLabel, mergeFormValues } from '../lib/utils'
import { DEFAULT_VALUES } from '../constants/schema'
import { mapConsignatariaToValues, mapConvenioToValues, mapVinculoToValues, serializeValues } from '../utils/mappers'
import type { EntityKind, FormValues, ModalState } from '../types'

function getErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof ApiError) return err.message
  if (err instanceof Error) return err.message
  return fallback
}

export function useCrudModal(
  authedApi: ApiClient,
  loadData: (client: ApiClient) => Promise<void>,
  setError: (msg: string | null) => void,
) {
  const [modal, setModal] = useState<ModalState | null>(null)
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)

  function openCreate(kind: EntityKind, initialValues: Partial<FormValues> = {}) {
    setError(null)
    setModal({
      kind,
      mode: 'create',
      title: `Novo ${getKindLabel(kind)}`,
      values: mergeFormValues(DEFAULT_VALUES[kind], initialValues),
    })
  }

  async function openEdit(kind: EntityKind, id: number) {
    setSaving(true)
    setError(null)

    try {
      let values: FormValues

      if (kind === 'consignatarias') {
        const item = await authedApi.getConsignataria(id)
        values = mapConsignatariaToValues(item)
      } else if (kind === 'convenios') {
        const item = await authedApi.getConvenio(id)
        values = mapConvenioToValues(item)
      } else {
        const item = await authedApi.getVinculo(id)
        values = mapVinculoToValues(item)
      }

      setModal({ kind, mode: 'edit', id, title: `Editar ${getKindLabel(kind)}`, values })
    } catch (err) {
      setError(getErrorMessage(err, 'Falha ao abrir registro.'))
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(kind: EntityKind, id: number) {
    const label = getKindLabel(kind)
    if (!window.confirm(`Remover este ${label.toLowerCase()}?`)) return

    setSaving(true)
    setError(null)

    try {
      if (kind === 'consignatarias') await authedApi.deleteConsignataria(id)
      else if (kind === 'convenios') await authedApi.deleteConvenio(id)
      else await authedApi.deleteVinculo(id)

      await loadData(authedApi)
      setNotice(`${label} removido com sucesso.`)
    } catch (err) {
      setError(getErrorMessage(err, 'Falha ao remover registro.'))
    } finally {
      setSaving(false)
    }
  }

  async function handleSave(values: FormValues) {
    if (!modal) return

    setSaving(true)
    setError(null)

    try {
      const payload = serializeValues(modal.kind, values)

      if (modal.mode === 'create') {
        if (modal.kind === 'consignatarias') await authedApi.createConsignataria(payload)
        else if (modal.kind === 'convenios') await authedApi.createConvenio(payload)
        else await authedApi.createVinculo(payload)
      } else if (modal.id != null) {
        if (modal.kind === 'consignatarias') await authedApi.updateConsignataria(modal.id, payload)
        else if (modal.kind === 'convenios') await authedApi.updateConvenio(modal.id, payload)
        else await authedApi.updateVinculo(modal.id, payload)
      }

      setModal(null)
      await loadData(authedApi)
      setNotice(`${getKindLabel(modal.kind)} salvo com sucesso.`)
    } catch (err) {
      setError(getErrorMessage(err, 'Falha ao salvar registro.'))
      throw err
    } finally {
      setSaving(false)
    }
  }

  return { modal, setModal, saving, notice, setNotice, openCreate, openEdit, handleDelete, handleSave }
}
