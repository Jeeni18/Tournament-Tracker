import { useMemo, useState } from 'react'
import { format, parseISO } from 'date-fns'
import { useGroupMatches } from '../hooks/useMatches'
import MatchCard from '../components/MatchCard'
import LoadingSpinner from '../components/LoadingSpinner'
import { Calendar } from 'lucide-react'

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

export default function FixturesPage() {
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
  if (error) return <div className="text-red-400 text-center py-16 font-medium">Failed to load fixtures</div>

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">

      {/* Header */}
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
          <Calendar size={22} className="text-[#D4AF37]" />
          Group Stage Fixtures
        </h1>
        <p className="text-[#64748B] text-sm mt-1">All 72 group stage matches</p>
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

      {/* Match list */}
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
    </div>
  )
}
