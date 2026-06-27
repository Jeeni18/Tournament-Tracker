import { useParams, Link } from 'react-router-dom'
import { useTeam } from '../hooks/useTeams'
import { useAllMatches } from '../hooks/useMatches'
import { useComputedStats } from '../hooks/useStats'
import LoadingSpinner from '../components/LoadingSpinner'
import FlagImg from '../components/FlagImg'
import { ArrowLeft, Target, Shield, TrendingUp } from 'lucide-react'
import { format, parseISO } from 'date-fns'

const POT_GRADIENTS: Record<number, string> = {
  1: 'from-amber-500 to-amber-700',
  2: 'from-blue-500 to-blue-700',
  3: 'from-emerald-500 to-emerald-700',
  4: 'from-violet-500 to-violet-700',
  5: 'from-rose-500 to-rose-700',
  6: 'from-pink-500 to-pink-700',
}

export default function TeamDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: team, isLoading } = useTeam(id!)
  const { data: matches } = useAllMatches()
  const { teamStats, isLoading: statsLoading } = useComputedStats()

  if (isLoading || statsLoading) return <LoadingSpinner text="Loading team…" />
  if (!team) return <div className="text-center py-16 text-slate-400">Team not found</div>

  const stats = teamStats.find(s => s.teamId === team.id)

  const teamMatches = matches
    ?.filter(m => m.completed && (m.home_team_id === team.id || m.away_team_id === team.id))
    .sort((a, b) => b.match_date.localeCompare(a.match_date)) ?? []

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">

      <Link to="/standings" className="inline-flex items-center gap-1.5 text-slate-400 hover:text-[#D4AF37] text-sm mb-7 transition-colors font-medium">
        <ArrowLeft size={15} /> Back to Standings
      </Link>

      {/* ── Header card ── */}
      <div className="glass-card p-6" style={{ marginBottom: '1.5rem' }}>
        <div className="flex items-start gap-4">
          <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${POT_GRADIENTS[team.pot_number] ?? 'from-slate-400 to-slate-600'} flex items-center justify-center text-white font-bold text-lg flex-shrink-0 shadow-lg`}>
            {team.team_name.slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-white leading-tight flex items-center gap-2">
              <FlagImg teamName={team.team_name} size={28} />
              {team.team_name}
            </h1>
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              <span className="text-xs bg-white/10 text-slate-300 px-2 py-0.5 rounded-md font-semibold">Pot {team.pot_number}</span>
              <span className="text-xs bg-white/10 text-slate-300 px-2 py-0.5 rounded-md font-semibold">Group {(team as any).group_name}</span>
              <Link to={`/owners/${team.owner_id}`} className="text-xs bg-[#D4AF37]/10 text-[#B8960A] border border-[#D4AF37]/20 px-2 py-0.5 rounded-md font-semibold hover:bg-[#D4AF37]/20 transition-colors">
                {team.owner?.name}
              </Link>
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-3xl font-extrabold text-[#D4AF37] tabular-nums leading-none">{(stats?.totalPoints ?? 0).toFixed(2)}</p>
            <p className="text-slate-400 text-xs mt-1 font-medium">Total Points</p>
          </div>
        </div>

        {/* Points breakdown */}
        {(stats?.roundPoints ?? 0) > 0 && (
          <div className="mt-4 pt-4 border-t border-white/10 flex items-center gap-5 text-xs">
            <span className="text-slate-400">
              Match: <span className="text-white font-semibold tabular-nums">{(stats?.matchPoints ?? 0).toFixed(2)}</span>
            </span>
            <span className="text-slate-400">
              Round: <span className="text-amber-400 font-bold">+{stats?.roundPoints ?? 0}</span>
            </span>
          </div>
        )}
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-3 gap-3" style={{ marginBottom: '1.5rem' }}>
        {[
          { icon: Target,     color: 'text-emerald-400', bg: 'bg-emerald-500/20', value: stats?.goalsScored ?? 0,    label: 'Goals Scored'   },
          { icon: Shield,     color: 'text-red-400',     bg: 'bg-red-500/20',     value: stats?.goalsConceded ?? 0,  label: 'Goals Conceded' },
          { icon: TrendingUp, color: 'text-[#D4AF37]',   bg: 'bg-amber-500/20',   value: null,                       label: 'Goal Diff', gd: stats?.goalDifference ?? 0 },
        ].map(({ icon: Icon, color, bg, value, label, gd }) => (
          <div key={label} className="glass-card p-4 text-center">
            <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center mx-auto mb-2.5`}>
              <Icon size={17} className={color} />
            </div>
            {gd !== undefined ? (
              <p className={`text-2xl font-bold tabular-nums ${gd > 0 ? 'text-emerald-400' : gd < 0 ? 'text-red-400' : 'text-white'}`}>
                {gd > 0 ? '+' : ''}{gd}
              </p>
            ) : (
              <p className="text-2xl font-bold text-white tabular-nums">{value}</p>
            )}
            <p className="text-slate-400 text-xs mt-0.5 font-medium">{label}</p>
          </div>
        ))}
      </div>

      {/* ── Match history ── */}
      <div className="glass-card p-5">
        <h2 className="font-bold text-white text-base mb-4">Match History</h2>
        {teamMatches.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-8">No matches played yet</p>
        ) : (
          <div className="space-y-1.5">
            {teamMatches.map(m => {
              const isHome = m.home_team_id === team.id
              const opponent = isHome ? m.away_team : m.home_team
              const teamScore = isHome ? m.home_score : m.away_score
              const oppScore  = isHome ? m.away_score : m.home_score
              const result    = teamScore! > oppScore! ? 'W' : teamScore! < oppScore! ? 'L' : 'D'
              const stageLabel = m.stage === 'group'
                ? `Grp ${m.group_name}`
                : m.stage.replace(/_/g, ' ')

              return (
                <div key={m.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                  <span className={`w-6 h-6 rounded-md flex items-center justify-center text-[11px] font-bold flex-shrink-0 ${
                    result === 'W' ? 'bg-emerald-500/20 text-emerald-400' :
                    result === 'L' ? 'bg-red-500/20 text-red-400' :
                    'bg-white/10 text-slate-400'
                  }`}>
                    {result}
                  </span>
                  <div className="flex-1 min-w-0 flex items-center gap-1.5">
                    <span className="text-slate-500 text-xs font-medium flex-shrink-0">{isHome ? 'vs' : '@'}</span>
                    <FlagImg teamName={opponent?.team_name ?? ''} size={14} />
                    <span className="text-white text-sm font-semibold truncate">{opponent?.team_name}</span>
                    <span className="text-slate-500 text-xs ml-1 flex-shrink-0">{stageLabel}</span>
                  </div>
                  <span className="text-white font-bold text-sm tabular-nums flex-shrink-0">
                    {isHome ? `${m.home_score}–${m.away_score}` : `${m.away_score}–${m.home_score}`}
                  </span>
                  <span className="text-slate-500 text-xs flex-shrink-0">{format(parseISO(m.match_date), 'MMM d')}</span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
