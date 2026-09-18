import {
  AlertTriangle,
  X,
} from 'lucide-react'

type Props = {
  open: boolean

  title: string
  message: string

  confirmLabel?: string
  cancelLabel?: string

  danger?: boolean
  loading?: boolean

  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmModal({
  open,
  title,
  message,

  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',

  danger = false,
  loading = false,

  onConfirm,
  onCancel,
}: Props) {
  if (!open) {
    return null
  }

  return (
    <div
      className="modal-backdrop"
      onMouseDown={() => {
        if (!loading) {
          onCancel()
        }
      }}
    >
      <div
        className="confirm-modal paper-card"
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >
        <div className="confirm-modal-header">
          <div className="confirm-icon">
            <AlertTriangle size={24} />
          </div>

          <div>
            <p className="eyebrow">
              CONFIRMAÇÃO
            </p>

            <h2>
              {title}
            </h2>
          </div>

          <button
            type="button"
            className="modal-close"
            onClick={onCancel}
            disabled={loading}
          >
            <X size={22} />
          </button>
        </div>

        <p className="confirm-message">
          {message}
        </p>

        <div className="product-modal-actions">
          <button
            type="button"
            className="btn"
            onClick={onCancel}
            disabled={loading}
          >
            {cancelLabel}
          </button>

          <button
            type="button"
            className={`btn ${
              danger
                ? 'danger'
                : 'primary'
            }`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading
              ? 'Processando...'
              : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}