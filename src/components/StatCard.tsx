interface StatCardProps {
  label: string
  value: string
  hint?: string
  tone?: 'mint' | 'rose' | 'amber' | 'slate'
}

const tones = {
  mint: 'from-emerald-400/20 to-emerald-400/5 text-emerald-200',
  rose: 'from-rose-400/20 to-rose-400/5 text-rose-200',
  amber: 'from-amber-400/20 to-amber-400/5 text-amber-200',
  slate: 'from-slate-400/20 to-slate-400/5 text-slate-100'
}

export function StatCard({ label, value, hint, tone = 'slate' }: StatCardProps) {
  return (
    <div className={`rounded-2xl border border-white/10 bg-gradient-to-br p-4 shadow-soft ${tones[tone]}`}>
      <p className="text-xs uppercase tracking-[0.24em] text-white/55">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
      {hint ? <p className="mt-1 text-sm text-white/70">{hint}</p> : null}
    </div>
  )
}