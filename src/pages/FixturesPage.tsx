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

// ── Group Stage tab ───────────────────────────────────────────────────────────

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
      .filter(m =>
        (!activeDate || m.match_date === activeDate) &&
        (selectedGroup === 'all' || m.group_name === selectedGroup)
      )
      .sort((a, b) => toMinutes(a.match_time) - toMinutes(b.match_time))
  }, [matches, activeDate, selectedGroup])

  const allDone    = (date: string) => matches?.filter(m => m.match_date === date).every(m => m.completed) ?? false
  const someDone   = (date: string) => matches?.some(m => m.match_date === date && m.completed) ?? false

  if (isLoading) return <LoadingSpinner text="Loading fixtures…" />
  if (error)     return <div className="text-red-400 text-center py-16">Failed to load fixtures</div>

  return (
    <div className="space-y-5">
      {/* Group filter — horizontal scroll */}
      <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-0.5">
        {['all', ...groups].map(g => (
          <button
            key={g}
            onClick={() => setSelectedGroup(g)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              selectedGroup === g
                ? 'bg-[#D4AF37] text-[#071A3D] shadow-sm font-bold'
                : 'bg-white/[0.05] text-slate-400 border border-white/[0.08] hover:text-white hover:border-white/20'
            }`}
          >
            {g === 'all' ? 'All Groups' : `Group ${g}`}
          </button>
        ))}
      </div>

      {/* Date scroller */}
      <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-1">
        {dates.map(date => {
          const d      = parseISO(date)
          const active = activeDate === date
          const done   = allDone(date)
          const partial = !done && someDone(date)
          return (
            <button
              key={date}
              onClick={() => setSelectedDate(date)}
              style={active ? {} : { background: 'rgba(14,42,90,0.45)' }}
              className={`flex-shrink-0 flex flex-col items-center px-3.5 py-2.5 rounded-xl transition-all relative min-w-[58px] ${
                active
                  ? 'bg-[#D4AF37] text-[#071A3D] shadow-lg shadow-[#D4AF37]/20 font-bold'
                  : 'border border-white/[0.08] text-slate-400 hover:text-white hover:border-white/20'
              }`}
            >
              <span className="text-[11px] font-bold">{format(d, 'MMM d')}</span>
              <span className="text-[9px] mt-0.5 opacity-60 font-medium">{format(d, 'EEE').toUpperCase()}</span>
              {(done || partial) && (
                <span className={`absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full ${
                  active ? 'bg-[#071A3D]/40' : done ? 'bg-emerald-400' : 'bg-[#D4AF37]/60'
                }`} />
              )}
            </button>
          )
        })}
      </div>

      {/* Match list */}
      {activeDate && (
        <div>
          {/* Date label */}
          <div className="flex items-center gap-3 mb-3">
            <p className="text-xs font-semibold text-slate-500 whitespace-nowrap">
              {format(parseISO(activeDate), 'EEEE, MMMM d, yyyy')}
            </p>
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
            <p className="text-[10px] text-slate-600 whitespace-nowrap">{filtered.length} matches</p>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-600">
              <Calendar size={28} className="mx-auto mb-3 opacity-20" />
              <p className="text-sm">No matches for this selection</p>
            </div>
          ) : (
            <div
              className="rounded-2xl overflow-hidden divide-y"
              style={{
                background: 'rgba(14,42,90,0.28)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderColor: 'rgba(255,255,255,0.08)',
              }}
            >
              {/* Table header */}
              <div className="flex items-center gap-3 px-4 py-2 border-b border-white/[0.05]">
                <div className="w-14 flex-shrink-0" />
                <p className="flex-1 text-right text-[9px] font-bold text-slate-600 uppercase tracking-widest pr-[86px]">Home</p>
                <p className="flex-1 text-left text-[9px] font-bold text-slate-600 uppercase tracking-widest pl-[86px]">Away</p>
              </div>
              <div className="divide-y divide-white/[0.05]">
                {filtered.map(match => <MatchCard key={match.id} match={match} />)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Knockout tab ──────────────────────────────────────────────────────────────

function KnockoutTab() {
  const { data: matches = [], isLoading: matchesLoading } = useKnockoutMatches()
  const { data: slots  = [], isLoading: slotsLoading    } = useBracketSlots()
  const [selectedRound, setSelectedRound] = useState<RoundKey>('round_of_32')

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

  const byDate = useMemo(() => {
    const map = new Map<string, typeof roundMatches>()
    for (const m of roundMatches) {
      const arr = map.get(m.match_date) ?? []
      arr.push(m)
      map.set(m.match_date, arr)
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b))
  }, [roundMatches])

  if (matchesLoading || slotsLoading) return <LoadingSpinner text="Loading knockout fixtures…" />

  const completedInRound = roundMatches.filter(m => m.completed).length

  return (
    <div className="space-y-6">
      {/* Round selector */}
      <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-1">
        {ROUNDS.map(r => {
          const total  = matches.filter(m => m.stage === r.key).length
          const done   = matches.filter(m => m.stage === r.key && m.completed).length
          const active = selectedRound === r.key
          return (
            <button
              key={r.key}
              onClick={() => setSelectedRound(r.key)}
              style={active ? {} : { background: 'rgba(14,42,90,0.45)' }}
              className={`flex-shrink-0 flex flex-col items-center px-4 py-2.5 rounded-xl transition-all min-w-[58px] border ${
                active
                  ? 'bg-rose-500 border-rose-400/60 text-white shadow-lg shadow-rose-500/20'
                  : 'border-white/[0.08] text-slate-400 hover:text-white hover:border-rose-500/30'
              }`}
            >
              <span className="text-[12px] font-black">{r.short}</span>
              {total > 0 && (
                <span className={`text-[9px] mt-0.5 tabular-nums ${active ? 'text-white/60' : 'text-slate-600'}`}>
                  {done}/{total}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Round label + progress */}
      <div className="flex items-center gap-3">
        <h2 className="text-base font-bold text-white whitespace-nowrap">
          {ROUNDS.find(r => r.key === selectedRound)?.label}
        </h2>
        {roundMatches.length > 0 && (
          <>
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
            <p className="text-[11px] text-slate-600 whitespace-nowrap tabular-nums">
              {completedInRound}/{roundMatches.length} played
            </p>
          </>
        )}
      </div>

      {/* Matches */}
      {matches.length === 0 ? (
        <div className="text-center py-16 text-slate-600">
          <GitBranch size={32} className="mx-auto mb-3 opacity-20" />
          <p className="font-medium text-sm">No knockout fixtures yet</p>
        </div>
      ) : byDate.length === 0 ? (
        <div className="text-center py-10 text-slate-600 text-sm">No matches in this round</div>
      ) : (
        <div className="space-y-8">
          {byDate.map(([date, dayMatches]) => (
            <div key={date}>
              {/* Date section header */}
              <div className="flex items-center gap-3 mb-4">
                <p className="text-[11px] font-semibold text-slate-500 whitespace-nowrap">
                  {format(parseISO(date), 'EEE, MMM d, yyyy')}
                </p>
                <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
              </div>
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
    </div>
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
        <p className="text-slate-600 text-sm mt-1">Schedule & results for all stages</p>
      </div>

      {/* Tab toggle — full width */}
      <div className="flex bg-white/[0.04] p-1 rounded-2xl mb-7 border border-white/[0.07]">
        <button
          onClick={() => setTab('group')}
          className={`flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
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
          className={`flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
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
