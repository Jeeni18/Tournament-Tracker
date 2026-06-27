import type { ReactNode } from 'react'

interface StatCardProps {
  label: string
  value: string | number
  sub?: string
  icon?: ReactNode
  highlight?: boolean
}

export default function StatCard({ label, value, sub, icon, highlight }: StatCardProps) {
  return (
    <div className={`glass-card p-5 flex items-start gap-4 ${highlight ? 'border-indigo-500/40' : ''}`}>
      {icon && (
        <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 flex-shrink-0">
          {icon}
        </div>
      )}
      <div>
        <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-bold text-white mt-0.5">{value}</p>
        {sub && <p className="text-slate-500 text-xs mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}
