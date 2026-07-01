import { Milk } from 'lucide-react'
import { MILK_QUANTITIES } from '../constants'

interface MilkCardProps {
  cashRate: number
  creditRate: number
  onCashRateChange: (value: number) => void
  onCreditRateChange: (value: number) => void
  onMilkSale: (payment: 'cash' | 'credit', quantity: string) => void
  onOpenCustom: (payment: 'cash' | 'credit') => void
}

export function MilkCard({ cashRate, creditRate, onCashRateChange, onCreditRateChange, onMilkSale, onOpenCustom }: MilkCardProps) {
  return (
    <section className="rounded-[1.5rem] border border-emerald-400/15 bg-gradient-to-br from-emerald-500/10 to-white/5 p-4 shadow-soft">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-200">
            <Milk className="h-3.5 w-3.5" />
            Milk first
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-white">Milk Counter</h2>
          <p className="mt-1 text-sm text-slate-300">Two-tap cash or credit sales with saved litre totals.</p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="rounded-2xl border border-white/10 bg-black/20 p-3">
          <span className="text-xs uppercase tracking-[0.22em] text-slate-400">Cash rate / litre</span>
          <input type="number" min="0" value={cashRate} onChange={(event) => onCashRateChange(Number(event.target.value) || 0)} className="mt-2 w-full rounded-xl border border-white/10 bg-ink-800 px-3 py-3 text-lg font-semibold text-white outline-none" />
        </label>
        <label className="rounded-2xl border border-white/10 bg-black/20 p-3">
          <span className="text-xs uppercase tracking-[0.22em] text-slate-400">Credit rate / litre</span>
          <input type="number" min="0" value={creditRate} onChange={(event) => onCreditRateChange(Number(event.target.value) || 0)} className="mt-2 w-full rounded-xl border border-white/10 bg-ink-800 px-3 py-3 text-lg font-semibold text-white outline-none" />
        </label>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
          <p className="text-sm font-semibold text-white">Cash Milk</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {MILK_QUANTITIES.map((quantity) => (
              <button key={`cash-${quantity}`} type="button" onClick={() => onMilkSale('cash', quantity)} className="rounded-2xl bg-emerald-500 px-3 py-3 text-base font-semibold text-ink-950 transition active:scale-[0.98]">
                {quantity}
              </button>
            ))}
            <button type="button" onClick={() => onOpenCustom('cash')} className="col-span-2 rounded-2xl bg-emerald-500/20 px-3 py-3 text-base font-semibold text-emerald-100 transition active:scale-[0.98]">
              Custom
            </button>
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
          <p className="text-sm font-semibold text-white">Credit Milk</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {MILK_QUANTITIES.map((quantity) => (
              <button key={`credit-${quantity}`} type="button" onClick={() => onMilkSale('credit', quantity)} className="rounded-2xl bg-rose-500 px-3 py-3 text-base font-semibold text-white transition active:scale-[0.98]">
                {quantity}
              </button>
            ))}
            <button type="button" onClick={() => onOpenCustom('credit')} className="col-span-2 rounded-2xl bg-rose-500/20 px-3 py-3 text-base font-semibold text-rose-100 transition active:scale-[0.98]">
              Custom
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}