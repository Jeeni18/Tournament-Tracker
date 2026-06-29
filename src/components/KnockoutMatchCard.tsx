import { useState, useEffect } from 'react'
import type { Match, Team } from '../types'
import { useAuth } from '../context/AuthContext'
import { useSaveKnockoutScore, useClearKnockoutScore } from '../hooks/useMatches'
import FlagImg from './FlagImg'

const ROUND_LABELS: Record<string, string> = {
  round_of_32:  'R32',
  round_of_16:  'R16',
  quarterfinal: 'QF',
  semifinal:    'SF',
  final:        'Final',
}

interface Props {
  match: Match
  homeTeam: Team | null
  awayTeam: Team | null
}

function TeamSide({ team, slot, align }: { team: Team | null; slot: number | null; align: 'left' | 'right' }) {
  const isRight = align === 'right'

  if (!team) {
    return (
      <div className={`flex-1 flex flex-col ${isRight ? 'items-end' : 'items-start'} justify-center min-w-0`}>
        <span className="text-slate-600 text-sm italic">{slot ? `Slot ${slot}` : 'TBD'}</span>
      </div>
    )
  }

  return (
    <div className={`flex-1 flex flex-col ${isRight ? 'items-end' : 'items-start'} justify-center gap-0.5 min-w-0`}>
      <div className={`flex items-center gap-2 min-w-0 ${isRight ? 'flex-row-reverse' : 'flex-row'}`}>
        <FlagImg teamName={team.team_name} size={22} />
        <p className="font-bold text-white text-[15px] leading-tight truncate">{team.team_name}</p>
      </div>
      <p className={`text-[11px] text-slate-500 truncate ${isRight ? 'text-right' : ''}`}>
        {team.owner?.name} · P{team.pot_number}
      </p>
    </div>
  )
}

export default function KnockoutMatchCard({ match, homeTeam, awayTeam }: Props) {
  const { role } = useAuth()
  const saveScore  = useSaveKnockoutScore()
  const clearScore = useClearKnockoutScore()

  const [homeInput,     setHomeInput]     = useState(match.home_score?.toString() ?? '')
  const [awayInput,     setAwayInput]     = useState(match.away_score?.toString() ?? '')
  const [extraTime,     setExtraTime]     = useState(match.extra_time_or_penalties)
  const [penaltyWinner, setPenaltyWinner] = useState<'home' | 'away' | null>(match.penalty_winner ?? null)
  const [saving,        setSaving]        = useState(false)
  const [confirmClear,  setConfirmClear]  = useState(false)

  useEffect(() => { setHomeInput(match.home_score?.toString() ?? '') },   [match.home_score])
  useEffect(() => { setAwayInput(match.away_score?.toString() ?? '') },   [match.away_score])
  useEffect(() => { setExtraTime(match.extra_time_or_penalties) },        [match.extra_time_or_penalties])
  useEffect(() => { setPenaltyWinner(match.penalty_winner ?? null) },     [match.penalty_winner])

  const isAdmin = role === 'admin'
  const teamsAssigned = !!homeTeam && !!awayTeam

  const homeVal = parseInt(homeInput)
  const awayVal = parseInt(awayInput)
  const isDraw  = !isNaN(homeVal) && !isNaN(awayVal) && homeVal === awayVal
  const showPenaltyPicker = isAdmin && extraTime && isDraw && homeInput !== '' && awayInput !== ''

  useEffect(() => {
    if (!showPenaltyPicker) setPenaltyWinner(null)
  }, [showPenaltyPicker])

  async function handleSave() {
    const h = parseInt(homeInput), a = parseInt(awayInput)
    if (isNaN(h) || isNaN(a) || h < 0 || a < 0) return
    const needsPenWinner = extraTime && h === a
    if (needsPenWinner && !penaltyWinner) return
    setSaving(true)
    try {
      await saveScore.mutateAsync({
        matchId:       match.id,
        homeTeamId:    homeTeam?.id ?? null,
        awayTeamId:    awayTeam?.id ?? null,
        homeScore:     h,
        awayScore:     a,
        extraTime,
        penaltyWinner: needsPenWinner ? penaltyWinner : null,
        completed:     true,
      })
    } finally {
      setSaving(false)
    }
  }

  const statusBadges = (
    <div className="flex items-center gap-1.5">
      {match.completed && match.penalty_winner && (
        <span className="text-[10px] font-bold text-violet-300 bg-violet-500/15 border border-violet-500/25 px-1.5 py-px rounded-md">PENS</span>
      )}
      {match.completed && match.extra_time_or_penalties && !match.penalty_winner && (
        <span className="text-[10px] font-bold text-amber-400 bg-amber-500/15 border border-amber-500/25 px-1.5 py-px rounded-md">AET</span>
      )}
      {match.completed && (
        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/25 px-1.5 py-px rounded-md">FT</span>
      )}
    </div>
  )

  return (
    <div className={`match-card overflow-hidden${match.completed ? ' completed' : ''}`}>

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.07]">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-px rounded-md tracking-wide">
            {ROUND_LABELS[match.stage] ?? match.stage}
          </span>
          <span className="text-[11px] text-slate-500 font-medium tabular-nums">{match.match_time}</span>
        </div>
        {statusBadges}
      </div>

      {/* ── Teams + Score ── */}
      <div className="flex items-center gap-3 px-5 py-4">
        <TeamSide team={homeTeam} slot={match.home_slot} align="right" />

        <div className="flex-shrink-0 flex flex-col items-center gap-1">
          {isAdmin ? (
            <div className="flex items-center gap-1.5">
              <input
                type="number" min="0" value={homeInput}
                onChange={e => setHomeInput(e.target.value)}
                className="w-11 h-11 text-center bg-white/10 border border-white/15 rounded-xl text-white text-lg font-bold focus:outline-none focus:border-[#D4AF37]/70 focus:bg-white/[0.15] tabular-nums transition-all"
              />
              <span className="text-white/20 font-light text-lg select-none">–</span>
              <input
                type="number" min="0" value={awayInput}
                onChange={e => setAwayInput(e.target.value)}
                className="w-11 h-11 text-center bg-white/10 border border-white/15 rounded-xl text-white text-lg font-bold focus:outline-none focus:border-[#D4AF37]/70 focus:bg-white/[0.15] tabular-nums transition-all"
              />
            </div>
          ) : match.completed ? (
            <div className="flex items-center gap-2 bg-white/[0.06] rounded-xl px-4 py-2">
              <span className="text-2xl font-black text-white tabular-nums">{match.home_score}</span>
              <span className="text-white/20 text-sm">–</span>
              <span className="text-2xl font-black text-white tabular-nums">{match.away_score}</span>
            </div>
          ) : (
            <span className="text-white/20 text-sm font-medium px-4 py-2 border border-white/[0.07] rounded-xl">vs</span>
          )}
        </div>

        <TeamSide team={awayTeam} slot={match.away_slot} align="left" />
      </div>

      {/* ── Penalty winner picker (admin, AET + draw) ── */}
      {showPenaltyPicker && (
        <div className="px-4 pb-3 pt-0 border-t border-white/[0.07] bg-violet-950/20">
          <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-widest pt-3 mb-2 text-center">
            Who won on penalties?
          </p>
          <div className="flex gap-2">
            {(['home', 'away'] as const).map(side => {
              const name = side === 'home' ? (homeTeam?.team_name ?? 'Home') : (awayTeam?.team_name ?? 'Away')
              const active = penaltyWinner === side
              return (
                <button
                  key={side}
                  onClick={() => setPenaltyWinner(side)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all border ${
                    active
                      ? 'bg-violet-500 border-violet-400 text-white shadow-lg shadow-violet-500/25'
                      : 'bg-white/[0.04] border-white/10 text-slate-400 hover:border-violet-500/40 hover:text-white'
                  }`}
                >
                  {name}
                </button>
              )
            })}
          </div>
          {!penaltyWinner && (
            <p className="text-[10px] text-amber-500/60 text-center mt-1.5">Select winner to enable Save</p>
          )}
        </div>
      )}

      {/* ── Penalty result (viewers only) ── */}
      {!isAdmin && match.completed && match.penalty_winner && (
        <div className="px-4 py-2 border-t border-white/[0.07] bg-violet-950/10 text-center">
          <p className="text-xs text-slate-400">
            Won on penalties:{' '}
            <span className="text-violet-300 font-semibold">
              {match.penalty_winner === 'home' ? homeTeam?.team_name ?? 'Home' : awayTeam?.team_name ?? 'Away'}
            </span>
          </p>
        </div>
      )}

      {/* ── Admin controls ── */}
      {isAdmin && (
        <div className="flex items-center justify-between gap-3 px-4 py-2.5 border-t border-white/[0.07] bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5 cursor-pointer select-none">
              <input
                type="checkbox" checked={extraTime}
                onChange={e => setExtraTime(e.target.checked)}
                className="accent-[#D4AF37] w-3.5 h-3.5"
              />
              <span className="text-[11px] text-slate-400 font-medium">Extra Time / Pens</span>
            </label>
            {!teamsAssigned && (
              <span className="text-[10px] text-amber-500/60">Assign bracket teams first</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {/* Clear result — only shown when a result is saved */}
            {match.completed && (
              confirmClear ? (
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-red-400/80">Remove result?</span>
                  <button
                    onClick={async () => {
                      await clearScore.mutateAsync(match.id)
                      setConfirmClear(false)
                    }}
                    disabled={clearScore.isPending}
                    className="px-2.5 py-1.5 bg-red-500/80 hover:bg-red-500 disabled:opacity-40 text-white text-[11px] font-bold rounded-xl transition-all"
                  >
                    {clearScore.isPending ? '…' : 'Yes, clear'}
                  </button>
                  <button
                    onClick={() => setConfirmClear(false)}
                    className="px-2.5 py-1.5 bg-white/[0.06] hover:bg-white/10 text-slate-400 text-[11px] font-bold rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmClear(true)}
                  className="px-3 py-1.5 bg-white/[0.05] hover:bg-red-500/10 border border-white/10 hover:border-red-500/30 text-slate-500 hover:text-red-400 text-[11px] font-bold rounded-xl transition-all"
                >
                  Clear
                </button>
              )
            )}
            <button
              onClick={handleSave}
              disabled={saving || (showPenaltyPicker && !penaltyWinner)}
              className="px-4 py-1.5 bg-[#D4AF37] hover:bg-[#C4A027] disabled:opacity-40 text-[#071A3D] text-xs font-black rounded-xl transition-all"
            >
              {saving ? 'Saving…' : match.completed ? 'Update' : 'Save'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
