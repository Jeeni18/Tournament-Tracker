import { useMemo, useState } from 'react'
import { format, parseISO } from 'date-fns'
import { useGroupMatches, useKnockoutMatches } from '../hooks/useMatches'
import { useBracketSlots } from '../hooks/useBracket'
import MatchCard from '../components/MatchCard'
import KnockoutMatchCard from '../components/KnockoutMatchCard'
import LoadingSpinner from '../components/LoadingSpinner'
import { Calendar, GitBranch } from 'lucide-react'
import type { Team } from '../types'

type Tab = 'group' | 'knockout'

type RoundKey = 'round_of_32' | 'round_of_16' | 'quarterfinal' | 'semifinal' | 'final'

const ROUNDS: { key: RoundKey; label: string; short: string }[] = [
  { key: 'round_of_32',  label: 'Round of 32',  short: 'R32'   },
  { key: 'round_of_16',  label: 'Round of 16',  short: 'R16'   },
  { key: 'quarterfinal', label: 'Quarterfinals', short: 'QF'    },
  { key: 'semifinal',    label: 'Semifinals',    short: 'SF'    },
  { key: 'final',        label: 'Final',         short: 'Final' },
]

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

// ── Group Stage tab ──────────────────────────────────────────────────────────

function GroupTab() {
  const { data: matches, isLoading, error } = useGroupMatches()
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedGroup, setSelectedGroup] = useState<string>('all')

  const dates = useMemo(() => {
    if (!matches) return []
    return Array.from(new Set(matches.map(m => m.match_date))).sort()
  }, [matches])

  const groups = useMemo(() => {
    if (!matches) return []
    return Array.from(new Set(matches.map(m => m.group_name).filter(Boolean) as string[])).sort()
  }, [matches])

  const activeDate = selectedDate ?? dates[0]

  const filtered = useMemo(() => {
    if (!matches) return []
    return matches
      .filter(m => (!activeDate || m.match_date === activeDate) && (selectedGroup === 'all' || m.group_name === selectedGroup))
      .sort((a, b) => toMinutes(a.match_time) - toMinutes(b.match_time))
  }, [matches, activeDate, selectedGroup])

  const completedOnDate = (date: string) => matches?.some(m => m.match_date === date && m.completed) ?? false

  if (isLoading) return <LoadingSpinner text="Loading fixtures…" />
  if (error) return <div className="text-red-400 text-center py-16">Failed to load fixtures</div>

  return (
    <>
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
            {g === 'all' ? 'All Groups' : `Group ${g}`}
          </button>
        ))}
      </div>

      {/* Date scroller */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-8 pb-1">
        {dates.map(date => {
          const d = parseISO(date)
          const active = activeDate === date
          const done = completedOnDate(date)
          return (
            <button
              key={date}
              onClick={() => setSelectedDate(date)}
              className={`flex-shrink-0 flex flex-col items-center px-4 py-3 rounded-2xl text-xs font-semibold transition-all min-w-[64px] relative ${
                active
                  ? 'bg-[#D4AF37] text-[#071A3D] shadow-lg shadow-[#D4AF37]/30 font-bold'
                  : 'bg-[#0E2A5A] text-slate-300 hover:bg-[#D4AF37]/15 hover:text-white border border-white/10'
              }`}
            >
              <span className="text-[11px] font-bold">{format(d, 'MMM d')}</span>
              <span className="opacity-70 mt-0.5">{format(d, 'EEE')}</span>
              {done && (
                <span className={`absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full ${active ? 'bg-[#071A3D]/40' : 'bg-emerald-400'}`} />
              )}
            </button>
          )
        })}
      </div>

      {activeDate && (
        <div>
          <p className="text-sm font-semibold text-slate-400 mb-5">
            {format(parseISO(activeDate), 'EEEE, MMMM d, yyyy')}
          </p>
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Calendar size={32} className="mx-auto mb-3 opacity-25" />
              <p>No matches for this selection</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map(match => <MatchCard key={match.id} match={match} />)}
            </div>
          )}
        </div>
      )}
    </>
  )
}

// ── Knockout tab ─────────────────────────────────────────────────────────────

function KnockoutTab() {
  const { data: matches = [], isLoading: matchesLoading } = useKnockoutMatches()
  const { data: slots = [], isLoading: slotsLoading } = useBracketSlots()
  const [selectedRound, setSelectedRound] = useState<RoundKey>('round_of_32')

  // Map from slot number → team
  const slotMap = useMemo(() => {
    const m = new Map<number, Team | null>()
    for (const s of slots) m.set(s.slot_number, s.team ?? null)
    return m
  }, [slots])

  const roundMatches = useMemo(() =>
    matches
      .filter(m => m.stage === selectedRound)
      .sort((a, b) => a.match_date.localeCompare(b.match_date) || toMinutes(a.match_time) - toMinutes(b.match_time)),
    [matches, selectedRound]
  )

  // Group by date
  const byDate = useMemo(() => {
    const map = new Map<string, typeof roundMatches>()
    for (const m of roundMatches) {
      const existing = map.get(m.match_date) ?? []
      existing.push(m)
      map.set(m.match_date, existing)
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b))
  }, [roundMatches])

  if (matchesLoading || slotsLoading) return <LoadingSpinner text="Loading knockout fixtures…" />

  const completedInRound = roundMatches.filter(m => m.completed).length

  return (
    <>
      {/* Round selector */}
      <div className="flex gap-1.5 flex-wrap mb-6">
        {ROUNDS.map(r => (
          <button
            key={r.key}
            onClick={() => setSelectedRound(r.key)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              selectedRound === r.key
                ? 'bg-rose-500 text-white shadow-sm shadow-rose-500/25 font-bold'
                : 'bg-[#0E2A5A] text-slate-300 hover:bg-rose-500/15 hover:text-white border border-white/10'
            }`}
          >
            {r.short}
          </button>
        ))}
      </div>

      {/* Round header */}
      <div className="mb-5">
        <h2 className="text-lg font-bold text-white">
          {ROUNDS.find(r => r.key === selectedRound)?.label}
        </h2>
        {matches.length > 0 && (
          <p className="text-xs text-slate-500 mt-0.5">
            {completedInRound} / {roundMatches.length} completed
          </p>
        )}
      </div>

      {matches.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <GitBranch size={36} className="mx-auto mb-3 opacity-20" />
          <p className="font-medium">No knockout fixtures yet</p>
          <p className="text-xs mt-1 text-slate-600">Run the database SQL setup below first</p>
        </div>
      ) : byDate.length === 0 ? (
        <div className="text-center py-12 text-slate-600 text-sm">No matches in this round</div>
      ) : (
        <div className="space-y-8">
          {byDate.map(([date, dayMatches]) => (
            <div key={date}>
              <p className="text-sm font-semibold text-slate-400 mb-3">
                {format(parseISO(date), 'EEEE, MMMM d, yyyy')}
              </p>
              <div className="space-y-3">
                {dayMatches.map(match => (
                  <KnockoutMatchCard
                    key={match.id}
                    match={match}
                    homeTeam={match.home_slot ? (slotMap.get(match.home_slot) ?? null) : null}
                    awayTeam={match.away_slot ? (slotMap.get(match.away_slot) ?? null) : null}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function FixturesPage() {
  const [tab, setTab] = useState<Tab>('group')

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">

      {/* Header */}
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
          <Calendar size={22} className="text-[#D4AF37]" />
          Fixtures
        </h1>
        <p className="text-[#64748B] text-sm mt-1">Group stage & knockout round schedules</p>
      </div>

      {/* Main tab toggle */}
      <div className="flex gap-1 bg-white/5 p-1 rounded-2xl mb-7 border border-white/10 w-fit">
        <button
          onClick={() => setTab('group')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            tab === 'group'
              ? 'bg-[#D4AF37] text-[#071A3D] shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Calendar size={14} />
          Group Stage
        </button>
        <button
          onClick={() => setTab('knockout')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            tab === 'knockout'
              ? 'bg-rose-500 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <GitBranch size={14} />
          Knockout
        </button>
      </div>

      {tab === 'group' ? <GroupTab /> : <KnockoutTab />}
    </div>
  )
}
