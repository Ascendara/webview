'use client'

import * as React from "react"

type ToastVariant = "default" | "destructive"

export interface Toast {
  id: string
  title?: string
  description?: string
  variant?: ToastVariant
}

interface ToastState {
  toasts: Toast[]
}

const listeners: Array<(state: ToastState) => void> = []

let memoryState: ToastState = { toasts: [] }

function dispatch(action: { type: string; toast?: Toast; toastId?: string }) {
  if (action.type === "ADD_TOAST") {
    memoryState.toasts = [action.toast!, ...memoryState.toasts]
  } else if (action.type === "REMOVE_TOAST") {
    memoryState.toasts = memoryState.toasts.filter((t) => t.id !== action.toastId)
  }
  listeners.forEach((listener) => listener(memoryState))
}

export function useToast() {
  const [state, setState] = React.useState<ToastState>(memoryState)

  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [])

  return {
    toasts: state.toasts,
    toast: (props: Omit<Toast, "id">) => {
      const id = Math.random().toString(36).substr(2, 9)
      dispatch({ type: "ADD_TOAST", toast: { ...props, id } })
      setTimeout(() => {
        dispatch({ type: "REMOVE_TOAST", toastId: id })
      }, 3000)
    },
    dismiss: (toastId: string) => {
      dispatch({ type: "REMOVE_TOAST", toastId })
    },
  }
}
