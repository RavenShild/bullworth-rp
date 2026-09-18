import {
  CheckCircle2,
  CircleAlert,
  Info,
  X,
} from 'lucide-react'
import { useEffect } from 'react'

export type ToastType =
  | 'success'
  | 'error'
  | 'info'

export type ToastData = {
  id: number
  type: ToastType
  message: string
}

type Props = {
  toast: ToastData
  onClose: (id: number) => void
}

export function Toast({
  toast,
  onClose,
}: Props) {
  useEffect(() => {
    const timer = window.setTimeout(() => {
      onClose(toast.id)
    }, 4500)

    return () => {
      window.clearTimeout(timer)
    }
  }, [toast.id, onClose])

  const Icon =
    toast.type === 'success'
      ? CheckCircle2
      : toast.type === 'error'
        ? CircleAlert
        : Info

  return (
    <div
      className={`toast toast-${toast.type}`}
    >
      <Icon size={20} />

      <span>
        {toast.message}
      </span>

      <button
        type="button"
        onClick={() =>
          onClose(toast.id)
        }
      >
        <X size={17} />
      </button>
    </div>
  )
}