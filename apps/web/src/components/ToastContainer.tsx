import {
  Toast,
  type ToastData,
} from './Toast'

type Props = {
  toasts: ToastData[]
  onClose: (id: number) => void
}

export function ToastContainer({
  toasts,
  onClose,
}: Props) {
  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          toast={toast}
          onClose={onClose}
        />
      ))}
    </div>
  )
}