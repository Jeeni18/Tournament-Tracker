import { Link } from 'react-router-dom'
import { useComputedStats } from '../hooks/useStats'
import { useTeams } from '../hooks/useTeams'
import LoadingSpinner from '../components/LoadingSpinner'
import FlagImg from '../components/FlagImg'
import { Crown, TrendingUp } from 'lucide-react'

export default function RankingsPage() {
  const { ownerStats, isLoading } = useComputedStats()
  const { data: teams = [] } = useTeams()

  if (isLoading) return <LoadingSpinner text="Loading rankings…" />

  const getOwnerTeams = (id: string) => teams.filter(t => t.owner_id === id)

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">

      <div className="mb-7">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
          <Crown size={22} className="text-[#D4AF37]" />
          Owner Rankings
        </h1>
        <p className="text-[#64748B] text-sm mt-1">
          Total Points = Match Points + Round Points
        </p>
      </div>

      {/* overflow-x-auto on the card itself clips to border-radius AND enables touch scroll */}
      <div className="glass-card overflow-x-auto">
        <table className="w-full min-w-[920px] text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/5 text-slate-400 text-[11px] uppercase tracking-widest font-semibold">
              <th className="text-left px-4 py-3.5 whitespace-nowrap">#</th>
              <th className="text-left px-4 py-3.5 whitespace-nowrap">Owner</th>
              <th className="text-center px-5 py-3.5 whitespace-nowrap">Played</th>
              <th className="text-center px-5 py-3.5 whitespace-nowrap border-l border-white/10">Match Pts</th>
              <th className="text-center px-5 py-3.5 whitespace-nowrap">Round Pts</th>
              <th className="text-center px-5 py-3.5 whitespace-nowrap border-l border-white/10">Total Pts</th>
              <th className="text-center px-5 py-3.5 whitespace-nowrap border-l border-white/10">GS</th>
              <th className="text-center px-5 py-3.5 whitespace-nowrap">GC</th>
              <th className="text-center px-5 py-3.5 whitespace-nowrap">GD</th>
              <th className="text-center px-5 py-3.5 whitespace-nowrap border-l border-white/10">Pts/G</th>
            </tr>
          </thead>
          <tbody>
            {ownerStats.map((o, i) => {
              const ownerTeams = getOwnerTeams(o.ownerId)
              return (
                <tr key={o.ownerId} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                  <td className="px-4 py-4">
                    <span className={`inline-flex w-7 h-7 rounded-lg items-center justify-center text-xs font-bold ${
                      i === 0 ? 'bg-[#D4AF37]/20 text-[#D4AF37]' :
                      i === 1 ? 'bg-white/10 text-slate-300' :
                      i === 2 ? 'bg-orange-500/20 text-orange-400' :
                      'bg-white/5 text-slate-500'
                    }`}>
                      {i + 1}
                    </span>
                  </td>
                  <td className="px-4 py-4 min-w-[180px]">
                    <Link to={`/owners/${o.ownerId}`} className="font-bold text-white hover:text-[#D4AF37] transition-colors block whitespace-nowrap">
                      {o.ownerName}
                    </Link>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {ownerTeams.map(t => (
                        <span key={t.id} className="inline-flex items-center gap-1 text-[10px] bg-white/10 text-slate-400 px-1.5 py-0.5 rounded-md font-medium whitespace-nowrap">
                          <FlagImg teamName={t.team_name} size={12} />
                          {t.team_name}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-center text-slate-300 tabular-nums whitespace-nowrap">{o.gamesPlayed}</td>
                  <td className="px-5 py-4 text-center text-slate-300 tabular-nums whitespace-nowrap border-l border-white/10">
                    {o.matchPoints.toFixed(2)}
                  </td>
                  <td className="px-5 py-4 text-center whitespace-nowrap">
                    <span className={`font-semibold tabular-nums ${o.roundPoints > 0 ? 'text-amber-400' : 'text-white/20'}`}>
                      {o.roundPoints}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-center whitespace-nowrap border-l border-white/10">
                    <span className="font-bold text-[#D4AF37] tabular-nums">{o.totalPoints.toFixed(2)}</span>
                  </td>
                  <td className="px-5 py-4 text-center text-slate-300 tabular-nums whitespace-nowrap border-l border-white/10">{o.goalsScored}</td>
                  <td className="px-5 py-4 text-center text-slate-300 tabular-nums whitespace-nowrap">{o.goalsConceded}</td>
                  <td className="px-5 py-4 text-center whitespace-nowrap">
                    <span className={`font-semibold tabular-nums ${
                      o.goalDifference > 0 ? 'text-emerald-400' :
                      o.goalDifference < 0 ? 'text-red-400' : 'text-slate-500'
                    }`}>
                      {o.goalDifference > 0 ? '+' : ''}{o.goalDifference}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-center text-emerald-400 tabular-nums whitespace-nowrap border-l border-white/10">
                    {o.gamesPlayed > 0 ? o.pointsPerGame.toFixed(2) : '—'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {ownerStats.length === 0 && (
          <div className="text-center py-16 text-slate-400">
            <TrendingUp size={36} className="mx-auto mb-3 opacity-20" />
            <p>Rankings will appear once matches are played</p>
          </div>
        )}
      </div>

      <p className="mt-3 text-[10px] text-slate-600 sm:hidden">← Scroll to see all columns</p>

      <div className="mt-4 flex gap-5 flex-wrap text-xs text-slate-500">
        <span><span className="text-slate-400 font-medium">Match Pts</span> — sum across all owned teams</span>
        <span><span className="text-amber-400 font-medium">Round Pts</span> — knockout round bonuses</span>
        <span><span className="text-[#D4AF37] font-medium">Total Pts</span> — primary ranking criterion</span>
      </div>
    </div>
  )
}
