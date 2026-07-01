import type { ReactNode } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  open: boolean
  title: string
  description?: string
  onClose: () => void
  children: ReactNode
}

export function Modal({ open, title, description, onClose, children }: ModalProps) {
  if (!open) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 px-3 pb-3 pt-8 backdrop-blur-sm sm:items-center">
      <div className="w-full max-w-lg rounded-[1.5rem] border border-white/10 bg-ink-900 shadow-soft">
        <div className="flex items-start justify-between gap-4 border-b border-white/10 px-4 py-4">
          <div>
            <h2 className="text-lg font-semibold text-white">{title}</h2>
            {description ? <p className="mt-1 text-sm text-slate-400">{description}</p> : null}
          </div>
          <button type="button" onClick={onClose} className="rounded-full border border-white/10 bg-white/5 p-2 text-slate-300 transition active:scale-95" aria-label="Close dialog">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="max-h-[80vh] overflow-y-auto px-4 py-4">{children}</div>
      </div>
    </div>
  )
}