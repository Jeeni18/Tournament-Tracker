import { useState, useEffect } from 'react'
import type { Match } from '../types'
import { useAuth } from '../context/AuthContext'
import { useUpdateMatchScore } from '../hooks/useMatches'
import FlagImg from './FlagImg'

export default function MatchCard({ match }: { match: Match }) {
  const { role } = useAuth()
  const updateScore = useUpdateMatchScore()
  const [homeInput, setHomeInput] = useState(match.home_score?.toString() ?? '')
  const [awayInput, setAwayInput] = useState(match.away_score?.toString() ?? '')
  const [saving, setSaving] = useState(false)

  useEffect(() => { setHomeInput(match.home_score?.toString() ?? '') }, [match.home_score])
  useEffect(() => { setAwayInput(match.away_score?.toString() ?? '') }, [match.away_score])

  const isAdmin = role === 'admin'
  const home = match.home_team
  const away = match.away_team

  if (!home || !away) {
    return <div className="px-5 py-3.5 text-slate-600 text-sm italic text-center">Teams TBD</div>
  }

  async function handleSave() {
    const h = parseInt(homeInput), a = parseInt(awayInput)
    if (isNaN(h) || isNaN(a) || h < 0 || a < 0) return
    setSaving(true)
    try {
      await updateScore.mutateAsync({ matchId: match.id, homeScore: h, awayScore: a, extraTime: false, completed: true })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={`relative flex items-center gap-3 px-4 py-3 transition-colors hover:bg-white/[0.03] ${
      match.completed ? 'bg-emerald-950/20' : ''
    }`}>
      {/* Completed left accent */}
      {match.completed && (
        <div className="absolute left-0 top-3 bottom-3 w-0.5 bg-emerald-500/50 rounded-r-full" />
      )}

      {/* Time + group */}
      <div className="w-14 flex-shrink-0 text-center pl-2">
        <p className="text-[10px] font-bold text-[#D4AF37]/80 tabular-nums whitespace-nowrap">{match.match_time}</p>
        <p className="text-[9px] mt-0.5 font-medium text-slate-600">
          {match.group_name ? `Grp ${match.group_name}` : ''}
          {match.completed ? <> · <span className="text-emerald-600/80">FT</span></> : null}
        </p>
      </div>

      {/* Home team */}
      <div className="flex-1 flex justify-end items-center gap-1.5 min-w-0">
        <div className="text-right min-w-0">
          <p className="text-sm font-semibold text-white leading-tight truncate">{home.team_name}</p>
          <p className="text-[10px] text-slate-500 truncate">{home.owner?.name}</p>
        </div>
        <FlagImg teamName={home.team_name} size={18} />
      </div>

      {/* Score */}
      <div className="flex-shrink-0 flex items-center justify-center gap-1.5" style={{ minWidth: isAdmin ? 96 : 68 }}>
        {isAdmin ? (
          <>
            <input
              type="number" min="0" value={homeInput}
              onChange={e => setHomeInput(e.target.value)}
              className="w-10 h-9 text-center text-sm font-bold text-white bg-white/10 border border-white/15 rounded-xl focus:outline-none focus:border-[#D4AF37]/70 focus:bg-white/[0.15] tabular-nums transition-all"
            />
            <span className="text-white/20 text-xs select-none">–</span>
            <input
              type="number" min="0" value={awayInput}
              onChange={e => setAwayInput(e.target.value)}
              className="w-10 h-9 text-center text-sm font-bold text-white bg-white/10 border border-white/15 rounded-xl focus:outline-none focus:border-[#D4AF37]/70 focus:bg-white/[0.15] tabular-nums transition-all"
            />
          </>
        ) : match.completed ? (
          <div className="flex items-center gap-1.5 bg-white/[0.07] rounded-xl px-3 py-1">
            <span className="text-[15px] font-black text-white tabular-nums">{match.home_score}</span>
            <span className="text-white/25 text-xs">–</span>
            <span className="text-[15px] font-black text-white tabular-nums">{match.away_score}</span>
          </div>
        ) : (
          <span className="text-[10px] text-white/20 border border-white/[0.07] rounded-lg px-2.5 py-1">vs</span>
        )}
      </div>

      {/* Away team */}
      <div className="flex-1 flex items-center gap-1.5 min-w-0">
        <FlagImg teamName={away.team_name} size={18} />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-white leading-tight truncate">{away.team_name}</p>
          <p className="text-[10px] text-slate-500 truncate">{away.owner?.name}</p>
        </div>
      </div>

      {/* Admin save */}
      {isAdmin && (
        <button
          onClick={handleSave} disabled={saving}
          className="flex-shrink-0 px-3 py-1.5 bg-[#D4AF37] hover:bg-[#C4A027] disabled:opacity-40 text-[#071A3D] text-[11px] font-black rounded-xl transition-all"
        >
          {saving ? '…' : match.completed ? 'Upd' : 'Save'}
        </button>
      )}
    </div>
  )
}
