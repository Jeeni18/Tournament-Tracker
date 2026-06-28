import { useState } from 'react'
import { Check, MapPin } from 'lucide-react'
import type { Match, Team } from '../types'
import { useAuth } from '../context/AuthContext'
import { useSaveKnockoutScore } from '../hooks/useMatches'
import FlagImg from './FlagImg'

const ROUND_LABELS: Record<string, string> = {
  round_of_32:  'Round of 32',
  round_of_16:  'Round of 16',
  quarterfinal: 'Quarterfinal',
  semifinal:    'Semifinal',
  final:        'Final',
}

const POT_COLORS: Record<number, string> = {
  1: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
  2: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
  3: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
  4: 'bg-violet-500/20 text-violet-400 border border-violet-500/30',
  5: 'bg-rose-500/20 text-rose-400 border border-rose-500/30',
  6: 'bg-pink-500/20 text-pink-400 border border-pink-500/30',
}

interface Props {
  match: Match
  homeTeam: Team | null
  awayTeam: Team | null
}

function SlotSide({
  team, slot, side,
}: {
  team: Team | null
  slot: number | null
  side: 'home' | 'away'
}) {
  const potCls = (n: number) =>
    (POT_COLORS[n] ?? 'bg-white/10 text-slate-400 border border-white/20') +
    ' text-[10px] font-bold px-1.5 py-px rounded-md'

  if (!team) {
    return (
      <div className={`flex-1 flex flex-col ${side === 'home' ? 'items-end' : 'items-start'} gap-1 min-w-0`}>
        <span className="text-slate-500 text-sm font-medium italic">
          {slot ? `Slot ${slot}` : 'TBD'}
        </span>
      </div>
    )
  }

  if (side === 'home') {
    return (
      <div className="flex-1 flex flex-col items-end gap-1 min-w-0">
        <div className="flex items-center justify-end gap-1.5 min-w-0">
          <p className="font-bold text-white text-sm sm:text-[15px] leading-tight text-right truncate">{team.team_name}</p>
          <FlagImg teamName={team.team_name} size={20} />
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400 text-xs truncate max-w-[80px]">{team.owner?.name}</span>
          <span className={potCls(team.pot_number)}>P{team.pot_number}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col items-start gap-1 min-w-0">
      <div className="flex items-center gap-1.5 min-w-0">
        <FlagImg teamName={team.team_name} size={20} />
        <p className="font-bold text-white text-sm sm:text-[15px] leading-tight truncate">{team.team_name}</p>
      </div>
      <div className="flex items-center gap-1.5">
        <span className={potCls(team.pot_number)}>P{team.pot_number}</span>
        <span className="text-slate-400 text-xs truncate max-w-[80px]">{team.owner?.name}</span>
      </div>
    </div>
  )
}

export default function KnockoutMatchCard({ match, homeTeam, awayTeam }: Props) {
  const { role } = useAuth()
  const saveScore = useSaveKnockoutScore()
  const [homeInput, setHomeInput] = useState(match.home_score?.toString() ?? '')
  const [awayInput, setAwayInput] = useState(match.away_score?.toString() ?? '')
  const [extraTime, setExtraTime] = useState(match.extra_time_or_penalties)
  const [saving, setSaving] = useState(false)

  const isAdmin = role === 'admin'
  const teamsAssigned = !!homeTeam && !!awayTeam

  async function handleSave() {
    const h = parseInt(homeInput), a = parseInt(awayInput)
    if (isNaN(h) || isNaN(a) || h < 0 || a < 0) return
    setSaving(true)
    try {
      await saveScore.mutateAsync({
        matchId: match.id,
        homeTeamId: homeTeam?.id ?? null,
        awayTeamId: awayTeam?.id ?? null,
        homeScore: h,
        awayScore: a,
        extraTime,
        completed: true,
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={`match-card${match.completed ? ' completed' : ''}`}>

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-px rounded-md">
            {ROUND_LABELS[match.stage] ?? match.stage}
          </span>
          <span className="text-xs text-slate-400 font-medium">{match.match_time}</span>
        </div>
        <div className="flex items-center gap-2">
          {match.extra_time_or_penalties && match.completed && (
            <span className="text-[11px] font-bold text-amber-400 bg-amber-500/20 px-1.5 py-px rounded-md">AET/P</span>
          )}
          {match.completed && (
            <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/20 px-1.5 py-px rounded-md">
              <Check size={10} strokeWidth={3} /> FT
            </span>
          )}
        </div>
      </div>

      {/* Teams + score */}
      <div className="flex items-center gap-3 px-4 py-4">
        <SlotSide team={homeTeam} slot={match.home_slot} side="home" />

        <div className="flex items-center gap-1.5 flex-shrink-0">
          {isAdmin ? (
            <>
              <input
                type="number" min="0" value={homeInput}
                onChange={e => setHomeInput(e.target.value)}
                className="w-12 h-11 text-center bg-white/10 border border-white/20 rounded-xl text-white text-lg font-bold focus:outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 transition-all tabular-nums"
              />
              <span className="text-white/30 font-light text-xl select-none">–</span>
              <input
                type="number" min="0" value={awayInput}
                onChange={e => setAwayInput(e.target.value)}
                className="w-12 h-11 text-center bg-white/10 border border-white/20 rounded-xl text-white text-lg font-bold focus:outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 transition-all tabular-nums"
              />
            </>
          ) : match.completed ? (
            <div className="flex items-center gap-1.5 px-1">
              <span className="text-[22px] font-black text-white tabular-nums leading-none">{match.home_score}</span>
              <span className="text-white/30 font-light text-xl">–</span>
              <span className="text-[22px] font-black text-white tabular-nums leading-none">{match.away_score}</span>
            </div>
          ) : (
            <span className="px-4 text-white/30 text-sm font-medium select-none">vs</span>
          )}
        </div>

        <SlotSide team={awayTeam} slot={match.away_slot} side="away" />
      </div>

      {/* Footer */}
      {(match.venue || isAdmin) && (
        <div className="flex items-center justify-between gap-3 px-4 pb-3.5 pt-1 border-t border-white/10">
          <div className="flex flex-col gap-0.5 min-w-0">
            {match.venue && (
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <MapPin size={10} className="flex-shrink-0 text-slate-500" />
                <span className="truncate">{match.venue}</span>
              </span>
            )}
            {isAdmin && !teamsAssigned && (
              <span className="text-[10px] text-amber-500/70">
                Assign teams in Bracket first for points to count
              </span>
            )}
          </div>

          {isAdmin && (
            <div className="flex items-center gap-3 flex-shrink-0">
              <label className="flex items-center gap-1.5 text-xs text-slate-400 cursor-pointer select-none">
                <input
                  type="checkbox" checked={extraTime}
                  onChange={e => setExtraTime(e.target.checked)}
                  className="accent-[#D4AF37]"
                />
                AET/P
              </label>
              <button
                onClick={handleSave} disabled={saving}
                className="px-4 py-1.5 bg-[#D4AF37] hover:bg-[#C4A027] disabled:opacity-40 text-[#071A3D] text-xs font-bold rounded-xl transition-all shadow-sm hover:shadow-md"
              >
                {saving ? 'Saving…' : match.completed ? 'Update' : 'Save'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
