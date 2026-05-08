import { useState, useEffect, type FormEvent } from 'react'
import { CheckCircle2, CircleAlert, LoaderCircle, X } from 'lucide-react'
import type { FormValues, ModalState } from '../../../types'
import { FIELD_SPECS } from '../../../constants/schema'
import { getKindLabel } from '../../../lib/utils'

export function EntityModal({
  modal,
  busy,
  onClose,
  onSave,
}: {
  modal: ModalState
  busy: boolean
  onClose: () => void
  onSave: (values: FormValues) => Promise<void>
}) {
  const [values, setValues] = useState<FormValues>(modal.values)
  const [localError, setLocalError] = useState<string | null>(null)

  useEffect(() => {
    setValues(modal.values)
    setLocalError(null)
  }, [modal])

  function updateField(key: string, nextValue: string | boolean) {
    setValues((current) => ({ ...current, [key]: nextValue }))
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLocalError(null)

    try {
      await onSave(values)
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Falha ao salvar.')
    }
  }

  const fields = FIELD_SPECS[modal.kind]

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div className="modal-panel" onClick={(event) => event.stopPropagation()} role="presentation">
        <div className="modal-header">
          <div>
            <p className="eyebrow">{getKindLabel(modal.kind)}</p>
            <h3>{modal.title}</h3>
          </div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Fechar">
            <X size={16} />
          </button>
        </div>

        {localError ? (
          <div className="banner banner-error">
            <CircleAlert size={16} />
            <span>{localError}</span>
          </div>
        ) : null}

        <form className="modal-form" onSubmit={submit}>
          {fields.map((field) => (
            <label key={field.key} className={`field ${field.type === 'textarea' ? 'field-wide' : ''}`}>
              <span>
                {field.label}
                {field.required ? ' *' : ''}
              </span>

              {field.type === 'boolean' ? (
                <div className="check-row">
                  <input
                    type="checkbox"
                    checked={Boolean(values[field.key])}
                    onChange={(event) => updateField(field.key, event.target.checked)}
                  />
                  <span>{Boolean(values[field.key]) ? 'Sim' : 'Nao'}</span>
                </div>
              ) : field.type === 'select' ? (
                <select
                  value={String(values[field.key] ?? '')}
                  onChange={(event) => updateField(field.key, event.target.value)}
                >
                  <option value="">Selecione</option>
                  {field.options?.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : field.type === 'textarea' ? (
                <textarea
                  rows={field.rows ?? 4}
                  value={String(values[field.key] ?? '')}
                  onChange={(event) => updateField(field.key, event.target.value)}
                  placeholder={field.placeholder}
                />
              ) : (
                <input
                  type={field.type}
                  step={field.step}
                  value={String(values[field.key] ?? '')}
                  onChange={(event) => updateField(field.key, event.target.value)}
                  placeholder={field.placeholder}
                />
              )}

              {field.help ? <small>{field.help}</small> : null}
            </label>
          ))}

          <div className="modal-actions">
            <button type="button" className="secondary-button" onClick={onClose} disabled={busy}>
              Cancelar
            </button>
            <button type="submit" className="primary-button" disabled={busy}>
              {busy ? <LoaderCircle size={16} className="spin" /> : <CheckCircle2 size={16} />}
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
