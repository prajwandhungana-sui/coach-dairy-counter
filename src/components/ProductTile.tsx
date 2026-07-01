import { Minus, Plus } from 'lucide-react'
import type { ProductDefinition } from '../types'

interface ProductTileProps {
  product: ProductDefinition
  quantity: number
  onIncrease: () => void
  onDecrease: () => void
}

export function ProductTile({ product, quantity, onIncrease, onDecrease }: ProductTileProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-3 shadow-soft">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-white">{product.name}</p>
          <p className="text-xs text-slate-400">Rs {product.price.toFixed(0)} · {product.category}</p>
        </div>
        <span className="rounded-full bg-white/10 px-3 py-1 text-sm font-semibold text-white">{quantity}</span>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <button type="button" onClick={onIncrease} className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-3 py-3 text-base font-semibold text-ink-950 transition active:scale-[0.98]">
          <Plus className="h-4 w-4" />
          +1
        </button>
        <button type="button" onClick={onDecrease} className="flex items-center justify-center gap-2 rounded-2xl bg-rose-500 px-3 py-3 text-base font-semibold text-white transition active:scale-[0.98]">
          <Minus className="h-4 w-4" />
          -1
        </button>
      </div>
    </div>
  )
}