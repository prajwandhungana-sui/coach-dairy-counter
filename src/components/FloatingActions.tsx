import { Copy, Undo2 } from 'lucide-react'

interface FloatingActionsProps {
  canUndo: boolean
  onUndo: () => void
  onCopy: () => void
}

export function FloatingActions({ canUndo, onUndo, onCopy }: FloatingActionsProps) {
  return (
    <div className="fixed bottom-24 right-3 z-40 flex flex-col gap-3 sm:bottom-6">
      <button type="button" onClick={onUndo} disabled={!canUndo} className="flex h-14 items-center justify-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 text-sm font-semibold text-white shadow-soft backdrop-blur disabled:cursor-not-allowed disabled:opacity-40">
        <Undo2 className="h-4 w-4" />
        Undo
      </button>
      <button type="button" onClick={onCopy} className="flex h-14 items-center justify-center gap-2 rounded-full bg-emerald-500 px-4 text-sm font-semibold text-ink-950 shadow-soft">
        <Copy className="h-4 w-4" />
        Copy
      </button>
    </div>
  )
}