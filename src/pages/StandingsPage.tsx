import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useComputedStats } from '../hooks/useStats'
import LoadingSpinner from '../components/LoadingSpinner'
import FlagImg from '../components/FlagImg'
import { BarChart3 } from 'lucide-react'

export default function StandingsPage() {
  const { teamStats, isLoading } = useComputedStats()
  const [selectedGroup, setSelectedGroup] = useState('all')

  const groups = useMemo(() => {
    const s = new Set(teamStats.map(t => t.groupName).filter(Boolean) as string[])
    return Array.from(s).sort()
  }, [teamStats])

  const filtered = useMemo(() => {
    if (selectedGroup === 'all') return teamStats
    return teamStats.filter(t => t.groupName === selectedGroup)
  }, [teamStats, selectedGroup])

  if (isLoading) return <LoadingSpinner text="Loading standings…" />

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">

      {/* Header */}
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
          <BarChart3 size={22} className="text-[#D4AF37]" />
          Team Standings
        </h1>
        <p className="text-[#64748B] text-sm mt-1">
          Ranked by Total Points → Goal Difference → Goals Scored
        </p>
      </div>

      {/* Group filter */}
      <div className="flex gap-1.5 flex-wrap mb-5">
        {['all', ...groups].map(g => (
          <button
            key={g}
            onClick={() => setSelectedGroup(g)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              selectedGroup === g
                ? 'bg-[#D4AF37] text-[#071A3D] shadow-sm shadow-[#D4AF37]/25 font-bold'
                : 'bg-[#0E2A5A] text-slate-300 hover:bg-[#D4AF37]/15 hover:text-white border border-white/10'
            }`}
          >
            {g === 'all' ? 'All Teams' : `Group ${g}`}
          </button>
        ))}
      </div>

      {/* Table — overflow-x-auto on the card itself clips corners AND enables touch scroll */}
      <div className="glass-card overflow-x-auto">
        <table className="w-full min-w-[860px] text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/5 text-slate-400 text-[11px] uppercase tracking-widest font-semibold">
              <th className="text-left px-4 py-3.5 whitespace-nowrap">#</th>
              <th className="text-left px-4 py-3.5 whitespace-nowrap">Team</th>
              <th className="text-center px-3 py-3.5 whitespace-nowrap">Grp</th>
              <th className="text-center px-3 py-3.5 whitespace-nowrap">Pot</th>
              <th className="text-center px-3 py-3.5 whitespace-nowrap">Owner</th>
              <th className="text-center px-3 py-3.5 whitespace-nowrap">P</th>
              <th className="text-center px-3 py-3.5 whitespace-nowrap">Match Pts</th>
              <th className="text-center px-3 py-3.5 whitespace-nowrap">Round Pts</th>
              <th className="text-center px-3 py-3.5 whitespace-nowrap">Total Pts</th>
              <th className="text-center px-3 py-3.5 whitespace-nowrap">GS</th>
              <th className="text-center px-3 py-3.5 whitespace-nowrap">GC</th>
              <th className="text-center px-3 py-3.5 whitespace-nowrap">GD</th>
              <th className="text-center px-3 py-3.5 whitespace-nowrap">Pts/G</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((t, i) => (
              <tr
                key={t.teamId}
                className="border-b border-white/10 hover:bg-white/5 transition-colors"
              >
                <td className="px-4 py-3">
                  <span className={`inline-flex w-6 h-6 rounded-md items-center justify-center text-xs font-bold ${
                    i === 0 ? 'bg-[#D4AF37]/20 text-[#D4AF37]' :
                    i === 1 ? 'bg-white/10 text-slate-300' :
                    i === 2 ? 'bg-orange-500/20 text-orange-400' :
                    'text-slate-500'
                  }`}>
                    {i + 1}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <Link to={`/teams/${t.teamId}`} className="font-semibold text-white hover:text-[#D4AF37] transition-colors inline-flex items-center gap-2">
                    <FlagImg teamName={t.teamName} size={18} />
                    {t.teamName}
                  </Link>
                </td>
                <td className="px-3 py-3 text-center text-slate-400 text-xs font-medium whitespace-nowrap">{t.groupName ?? '—'}</td>
                <td className="px-3 py-3 text-center whitespace-nowrap">
                  <span className="text-[11px] bg-white/10 text-slate-300 px-1.5 py-0.5 rounded-md font-semibold">
                    P{t.potNumber}
                  </span>
                </td>
                <td className="px-3 py-3 text-center whitespace-nowrap">
                  <Link to={`/owners/${t.ownerId}`} className="text-slate-400 hover:text-[#D4AF37] text-xs font-medium transition-colors">
                    {t.ownerName}
                  </Link>
                </td>
                <td className="px-3 py-3 text-center text-slate-300 text-sm tabular-nums whitespace-nowrap">{t.gamesPlayed}</td>
                <td className="px-3 py-3 text-center text-slate-300 text-sm tabular-nums whitespace-nowrap">
                  {t.matchPoints.toFixed(2)}
                </td>
                <td className="px-3 py-3 text-center whitespace-nowrap">
                  <span className={`text-sm font-semibold tabular-nums ${t.roundPoints > 0 ? 'text-amber-400' : 'text-white/20'}`}>
                    {t.roundPoints}
                  </span>
                </td>
                <td className="px-3 py-3 text-center whitespace-nowrap">
                  <span className="font-bold text-[#D4AF37] tabular-nums">{t.totalPoints.toFixed(2)}</span>
                </td>
                <td className="px-3 py-3 text-center text-slate-300 text-sm tabular-nums whitespace-nowrap">{t.goalsScored}</td>
                <td className="px-3 py-3 text-center text-slate-300 text-sm tabular-nums whitespace-nowrap">{t.goalsConceded}</td>
                <td className="px-3 py-3 text-center whitespace-nowrap">
                  <span className={`font-semibold text-sm tabular-nums ${
                    t.goalDifference > 0 ? 'text-emerald-400' :
                    t.goalDifference < 0 ? 'text-red-400' :
                    'text-slate-500'
                  }`}>
                    {t.goalDifference > 0 ? '+' : ''}{t.goalDifference}
                  </span>
                </td>
                <td className="px-3 py-3 text-center text-emerald-400 text-sm tabular-nums whitespace-nowrap">
                  {t.gamesPlayed > 0 ? (t.matchPoints / t.gamesPlayed).toFixed(2) : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="text-center py-14 text-slate-400">No standings data yet</div>
        )}
      </div>

      <p className="mt-3 text-[10px] text-slate-600 sm:hidden">← Scroll left/right to see all columns</p>

      {/* Legend */}
      <div className="mt-4 flex gap-5 flex-wrap text-xs text-slate-500">
        <span><span className="text-slate-400 font-medium">Match Pts</span> — from game results</span>
        <span><span className="text-amber-400 font-medium">Round Pts</span> — +1 per knockout round reached (max 6)</span>
        <span><span className="text-[#D4AF37] font-medium">Total Pts</span> — primary ranking criterion</span>
      </div>
    </div>
  )
}
