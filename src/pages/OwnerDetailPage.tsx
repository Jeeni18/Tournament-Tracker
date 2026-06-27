import { useParams, Link } from 'react-router-dom'
import { useOwners } from '../hooks/useOwners'
import { useTeams } from '../hooks/useTeams'
import { useComputedStats, useAllMatchesForStats } from '../hooks/useStats'
import LoadingSpinner from '../components/LoadingSpinner'
import FlagImg from '../components/FlagImg'
import { ArrowLeft, Trophy, Activity } from 'lucide-react'
import { format, parseISO } from 'date-fns'

function toMinutes(time: string): number {
  const m = time.match(/(\d+):(\d+)\s*(AM|PM)/i)
  if (!m) return 0
  let h = parseInt(m[1])
  const min = parseInt(m[2])
  const p = m[3].toUpperCase()
  if (p === 'AM' && h === 12) h = 0
  if (p === 'PM' && h !== 12) h += 12
  return h * 60 + min
}

export default function OwnerDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: owners, isLoading: ownersLoading } = useOwners()
  const { data: teams = [] } = useTeams()
  const { data: matches = [] } = useAllMatchesForStats()
  const { teamStats, ownerStats, isLoading: statsLoading } = useComputedStats()

  if (ownersLoading || statsLoading) return <LoadingSpinner text="Loading owner…" />

  const owner = owners?.find(o => o.id === id)
  if (!owner) return <div className="text-center py-16 text-slate-400">Owner not found</div>

  const ownerStat      = ownerStats.find(o => o.ownerId === id)
  const ownerTeamStats = teamStats.filter(t => t.ownerId === id).sort((a, b) => b.totalPoints - a.totalPoints)
  const ownerTeams     = teams.filter(t => t.owner_id === id)
  const ownerTeamIds   = new Set(ownerTeams.map(t => t.id))

  const ownerMatches = matches
    .filter(m => m.completed && (ownerTeamIds.has(m.home_team_id) || ownerTeamIds.has(m.away_team_id)))
    .sort((a, b) => b.match_date.localeCompare(a.match_date) || toMinutes(b.match_time) - toMinutes(a.match_time))
    .slice(0, 8)

  const totalPoints   = ownerStat?.totalPoints    ?? 0
  const matchPoints   = ownerStat?.matchPoints    ?? 0
  const roundPoints   = ownerStat?.roundPoints    ?? 0
  const gamesPlayed   = ownerStat?.gamesPlayed    ?? 0
  const totalGD       = ownerStat?.goalDifference ?? 0
  const totalGoals    = ownerStat?.goalsScored    ?? 0
  const totalConceded = ownerStat?.goalsConceded  ?? 0
  const ppg           = gamesPlayed > 0 ? (totalPoints / gamesPlayed).toFixed(2) : '—'

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">

      <Link to="/rankings" className="inline-flex items-center gap-1.5 text-slate-400 hover:text-[#D4AF37] text-sm mb-7 transition-colors font-medium">
        <ArrowLeft size={15} /> Back to Rankings
      </Link>

      {/* ── Header ── */}
      <div className="glass-card p-6" style={{ marginBottom: '1.5rem' }}>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37] font-extrabold text-2xl flex-shrink-0">
            {owner.name[0]}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-white">{owner.name}</h1>
            <p className="text-slate-400 text-sm mt-0.5 font-medium">{ownerTeams.length} teams owned</p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-3xl font-extrabold text-[#D4AF37] tabular-nums leading-none">{totalPoints.toFixed(2)}</p>
            <p className="text-slate-400 text-xs mt-1 font-medium">Total Points</p>
          </div>
        </div>

        {roundPoints > 0 && (
          <div className="mt-4 pt-4 border-t border-white/10 flex items-center gap-5 text-xs">
            <span className="text-slate-400">Match: <span className="text-white font-semibold tabular-nums">{matchPoints.toFixed(2)}</span></span>
            <span className="text-slate-400">Round: <span className="text-amber-400 font-bold">+{roundPoints}</span></span>
          </div>
        )}
      </div>

      {/* ── Stats grid ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3" style={{ marginBottom: '1.5rem' }}>
        {[
          { label: 'Matches Played', value: gamesPlayed, color: 'text-white'        },
          { label: 'Pts / Game',     value: ppg,         color: 'text-emerald-400'  },
          { label: 'Goals Scored',   value: totalGoals,  color: 'text-white'        },
          {
            label: 'Goal Diff',
            value: totalGD > 0 ? `+${totalGD}` : totalGD,
            color: totalGD > 0 ? 'text-emerald-400' : totalGD < 0 ? 'text-red-400' : 'text-white',
          },
        ].map(s => (
          <div key={s.label} className="glass-card p-4 text-center">
            <p className={`text-2xl font-bold tabular-nums ${s.color}`}>{s.value}</p>
            <p className="text-slate-400 text-xs mt-1 font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Owned Teams ── */}
      <div className="glass-card p-5" style={{ marginBottom: '1.5rem' }}>
        <h2 className="font-bold text-white text-base flex items-center gap-2 mb-4">
          <Trophy size={15} className="text-[#D4AF37]" />
          Teams
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {ownerTeamStats.map(t => (
            <Link
              key={t.teamId}
              to={`/teams/${t.teamId}`}
              className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
            >
              <div className="min-w-0">
                <p className="font-semibold text-white text-sm truncate flex items-center gap-1.5">
                  <FlagImg teamName={t.teamName} size={16} />
                  {t.teamName}
                </p>
                <div className="flex gap-2 mt-0.5 text-xs text-slate-400 font-medium">
                  <span>P{t.potNumber}</span>
                  {t.groupName && <span>Grp {t.groupName}</span>}
                  <span>{t.gamesPlayed}P</span>
                  <span className={t.goalDifference > 0 ? 'text-emerald-400' : t.goalDifference < 0 ? 'text-red-400' : ''}>
                    GD {t.goalDifference > 0 ? '+' : ''}{t.goalDifference}
                  </span>
                </div>
              </div>
              <span className="text-[#D4AF37] font-bold text-sm tabular-nums ml-3 flex-shrink-0">
                {t.totalPoints.toFixed(2)}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Extra stats ── */}
      <div className="glass-card px-5 py-4 flex items-center justify-between" style={{ marginBottom: '1.5rem' }}>
        <p className="text-slate-400 text-sm font-medium">Total Goals Conceded</p>
        <p className="text-white font-bold tabular-nums">{totalConceded}</p>
      </div>

      {/* ── Recent matches ── */}
      {ownerMatches.length > 0 && (
        <div className="glass-card p-5">
          <h2 className="font-bold text-white text-base flex items-center gap-2 mb-4">
            <Activity size={15} className="text-[#D4AF37]" />
            Recent Results
          </h2>
          <div className="space-y-1.5">
            {ownerMatches.map(m => {
              const homeOwned = ownerTeamIds.has(m.home_team_id)
              const awayOwned = ownerTeamIds.has(m.away_team_id)
              return (
                <div key={m.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-sm">
                  <div className="flex-1 flex justify-end items-center gap-1.5 min-w-0">
                    <p className={`font-semibold truncate ${homeOwned ? 'text-[#D4AF37]' : 'text-slate-400'}`}>
                      {m.home_team?.team_name}
                    </p>
                    <FlagImg teamName={m.home_team?.team_name ?? ''} size={14} />
                  </div>
                  <div className="text-center flex-shrink-0 min-w-[80px]">
                    <p className="text-white font-bold tabular-nums">{m.home_score} — {m.away_score}</p>
                    <p className="text-slate-500 text-[10px] font-medium">
                      {format(parseISO(m.match_date), 'MMM d')}
                      {m.stage === 'group' ? ` · Grp ${m.group_name}` : ` · ${m.stage.replace(/_/g, ' ')}`}
                    </p>
                  </div>
                  <div className="flex-1 flex items-center gap-1.5 min-w-0">
                    <FlagImg teamName={m.away_team?.team_name ?? ''} size={14} />
                    <p className={`font-semibold truncate ${awayOwned ? 'text-[#D4AF37]' : 'text-slate-400'}`}>
                      {m.away_team?.team_name}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
