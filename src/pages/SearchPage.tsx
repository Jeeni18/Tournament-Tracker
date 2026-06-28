import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Search, Users, Trophy } from 'lucide-react'
import { useTeams } from '../hooks/useTeams'
import { useOwners } from '../hooks/useOwners'
import { useGroupMatches } from '../hooks/useMatches'

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const { data: teams } = useTeams()
  const { data: owners } = useOwners()
  const { data: matches } = useGroupMatches()

  const q = query.toLowerCase().trim()

  const filteredTeams = useMemo(() =>
    !q ? [] : (teams ?? []).filter(t => t.team_name.toLowerCase().includes(q)).slice(0, 8),
    [teams, q]
  )
  const filteredOwners = useMemo(() =>
    !q ? [] : (owners ?? []).filter(o => o.name.toLowerCase().includes(q)).slice(0, 6),
    [owners, q]
  )
  const filteredMatches = useMemo(() =>
    !q ? [] : (matches ?? []).filter(m =>
      m.home_team?.team_name.toLowerCase().includes(q) ||
      m.away_team?.team_name.toLowerCase().includes(q) ||
      m.venue?.toLowerCase().includes(q)
    ).slice(0, 6),
    [matches, q]
  )

  const hasResults = filteredTeams.length > 0 || filteredOwners.length > 0 || filteredMatches.length > 0

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">

      <h1 className="text-2xl font-bold text-white mb-6">Search</h1>

      {/* Search input */}
      <div className="relative mb-8">
        {/* Icon sits in its own flex container so it never overlaps the input background */}
        <span className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
          <Search size={17} className="text-slate-400 flex-shrink-0" />
        </span>
        <input
          type="text" value={query} onChange={e => setQuery(e.target.value)}
          placeholder="Teams, owners, venues…" autoFocus
          className="w-full bg-white/10 border border-white/20 rounded-2xl pl-12 pr-4 py-3.5 text-white placeholder-slate-500 focus:outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 transition-all text-[15px] font-medium"
        />
      </div>

      {/* Empty states */}
      {!q && (
        <div className="text-center py-16 text-slate-500">
          <Search size={36} className="mx-auto mb-3 opacity-25" />
          <p className="font-medium">Start typing to search</p>
        </div>
      )}
      {q && !hasResults && (
        <div className="text-center py-16 text-slate-500">
          <p className="font-medium">No results for "<span className="text-slate-300">{query}</span>"</p>
        </div>
      )}

      {/* Teams */}
      {filteredTeams.length > 0 && (
        <section className="mb-7">
          <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
            <Trophy size={11} /> Teams
          </h2>
          <div className="space-y-2">
            {filteredTeams.map(t => (
              <Link key={t.id} to={`/teams/${t.id}`}
                className="flex items-center justify-between px-4 py-3.5 glass-card hover:-translate-y-0.5 transition-all duration-150">
                <div>
                  <p className="font-semibold text-white">{t.team_name}</p>
                  <p className="text-xs text-slate-400 mt-0.5 font-medium">Pot {t.pot_number} · Group {(t as any).group_name} · {t.owner?.name}</p>
                </div>
                <span className="text-[#D4AF37] font-bold text-sm tabular-nums ml-4 flex-shrink-0">
                  {Number(t.total_points).toFixed(2)}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Owners */}
      {filteredOwners.length > 0 && (
        <section className="mb-7">
          <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
            <Users size={11} /> Owners
          </h2>
          <div className="space-y-2">
            {filteredOwners.map(o => (
              <Link key={o.id} to={`/owners/${o.id}`}
                className="flex items-center gap-3 px-4 py-3.5 glass-card hover:-translate-y-0.5 transition-all duration-150">
                <div className="w-9 h-9 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] font-bold text-sm flex-shrink-0 border border-[#D4AF37]/20">
                  {o.name[0]}
                </div>
                <p className="font-semibold text-white">{o.name}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Matches */}
      {filteredMatches.length > 0 && (
        <section>
          <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Matches</h2>
          <div className="space-y-2">
            {filteredMatches.map(m => (
              <div key={m.id} className="flex items-center gap-3 px-4 py-3.5 glass-card">
                <div className="flex-1 text-right min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{m.home_team?.team_name}</p>
                </div>
                <div className="text-center flex-shrink-0 w-16">
                  {m.completed
                    ? <p className="text-white font-bold tabular-nums">{m.home_score}–{m.away_score}</p>
                    : <p className="text-slate-400 text-sm font-medium">vs</p>}
                  <p className="text-slate-500 text-[10px] font-medium">Grp {m.group_name}</p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{m.away_team?.team_name}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
