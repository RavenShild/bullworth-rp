import {
  useCallback,
  useRef,
  useState,
} from 'react'

import type {
  ToastData,
  ToastType,
} from '../components/Toast'

export function useToast() {
  const [toasts, setToasts] =
    useState<ToastData[]>([])

  const nextId = useRef(1)

  const showToast = useCallback(
    (
      message: string,
      type: ToastType = 'info'
    ) => {
      const id = nextId.current++

      setToasts((current) => [
        ...current,
        {
          id,
          message,
          type,
        },
      ])
    },
    []
  )

  const removeToast = useCallback(
    (id: number) => {
      setToasts((current) =>
        current.filter(
          (toast) =>
            toast.id !== id
        )
      )
    },
    []
  )

  return {
    toasts,
    showToast,
    removeToast,
  }
}