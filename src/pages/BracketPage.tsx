import { useState } from 'react'
import { useBracketSlots, useUpdateBracketSlot } from '../hooks/useBracket'
import { useAllMatches, useUpdateMatchScore } from '../hooks/useMatches'
import { useTeams, useUpdateTeamAdvancement } from '../hooks/useTeams'
import { useAuth } from '../context/AuthContext'
import LoadingSpinner from '../components/LoadingSpinner'
import { GitBranch, Check, X, Trophy, Settings } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { KNOCKOUT_FIXTURES } from '../data/tournamentData'
import type { Team, BracketSlot, Match } from '../types'

// ─── Constants ───────────────────────────────────────────────

const ROUNDS = [
  { key: 'round_of_32',  label: 'Round of 32',   slotRange: [1,  32] as [number,number], attrKey: 'round_of_32'  as keyof Team },
  { key: 'round_of_16',  label: 'Round of 16',   slotRange: [33, 48] as [number,number], attrKey: 'round_of_16'  as keyof Team },
  { key: 'quarterfinal', label: 'Quarterfinals', slotRange: [49, 56] as [number,number], attrKey: 'quarterfinal' as keyof Team },
  { key: 'semifinal',    label: 'Semifinals',    slotRange: [57, 60] as [number,number], attrKey: 'semifinal'    as keyof Team },
  { key: 'final',        label: 'Final',         slotRange: [61, 62] as [number,number], attrKey: 'final_round'  as keyof Team },
]

const ROUND_ATTRS: { key: keyof Team; short: string; label: string; pts: number }[] = [
  { key: 'round_of_32',  short: 'R32',   label: 'Round of 32',   pts: 1 },
  { key: 'round_of_16',  short: 'R16',   label: 'Round of 16',   pts: 2 },
  { key: 'quarterfinal', short: 'QF',    label: 'Quarterfinals', pts: 3 },
  { key: 'semifinal',    short: 'SF',    label: 'Semifinals',    pts: 4 },
  { key: 'final_round',  short: 'Final', label: 'Final',         pts: 5 },
  { key: 'winner',       short: 'W',     label: 'Winner',        pts: 6 },
]

// ─── Helpers ─────────────────────────────────────────────────

function getRoundPoints(team: Team) {
  return ROUND_ATTRS.reduce((sum, a) => sum + (team[a.key] ? 1 : 0), 0)
}

function getTeamInSlot(n: number, slots: BracketSlot[]): Team | undefined {
  return slots.find(s => s.slot_number === n)?.team ?? undefined
}

function findMatchForFixture(
  f: (typeof KNOCKOUT_FIXTURES)[0],
  slots: BracketSlot[],
  matches: Match[]
): Match | undefined {
  const hId = slots.find(s => s.slot_number === f.slot_home)?.team_id
  const aId = slots.find(s => s.slot_number === f.slot_away)?.team_id
  if (!hId || !aId) return undefined
  return matches.find(m =>
    m.stage === f.round_name &&
    ((m.home_team_id === hId && m.away_team_id === aId) ||
     (m.home_team_id === aId && m.away_team_id === hId))
  )
}

function groupByDate(roundKey: string) {
  const map = new Map<string, typeof KNOCKOUT_FIXTURES>()
  for (const f of KNOCKOUT_FIXTURES.filter(f => f.round_name === roundKey)) {
    const list = map.get(f.match_date) ?? []
    list.push(f)
    map.set(f.match_date, list)
  }
  return map
}

// ─── SlotCell ────────────────────────────────────────────────

function SlotCell({ n, slots, isAdmin, onEdit }: { n: number; slots: BracketSlot[]; isAdmin: boolean; onEdit: (n: number) => void }) {
  const team = getTeamInSlot(n, slots)
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs transition-all ${
      team
        ? 'bg-[#D4AF37]/10 border-[#D4AF37]/30 text-white shadow-sm'
        : 'bg-white/5 border-white/10 text-slate-500'
    }`}>
      <span className="text-[10px] text-slate-400 font-mono w-5 flex-shrink-0 font-bold">{n}</span>
      <span className="flex-1 font-semibold truncate">{team?.team_name ?? '—'}</span>
      {team && <span className="text-slate-400 text-[10px] truncate hidden sm:block">{team.owner?.name}</span>}
      {isAdmin && (
        <button onClick={() => onEdit(n)} className="text-slate-400 hover:text-[#D4AF37] transition-colors flex-shrink-0 text-sm">✎</button>
      )}
    </div>
  )
}

// ─── FixtureCard ─────────────────────────────────────────────

function FixtureCard({ f, slots, allMatches }: { f: (typeof KNOCKOUT_FIXTURES)[0]; slots: BracketSlot[]; allMatches: Match[] }) {
  const { role } = useAuth()
  const update = useUpdateMatchScore()
  const isAdmin = role === 'admin'

  const homeTeam = getTeamInSlot(f.slot_home, slots)
  const awayTeam = getTeamInSlot(f.slot_away, slots)
  const match = findMatchForFixture(f, slots, allMatches)

  const [home, setHome] = useState(match?.home_score?.toString() ?? '')
  const [away, setAway] = useState(match?.away_score?.toString() ?? '')
  const [et, setEt] = useState(match?.extra_time_or_penalties ?? false)
  const [saving, setSaving] = useState(false)

  async function save() {
    if (!match) return
    const h = parseInt(home), a = parseInt(away)
    if (isNaN(h) || isNaN(a)) return
    setSaving(true)
    try { await update.mutateAsync({ matchId: match.id, homeScore: h, awayScore: a, extraTime: et, completed: true }) }
    finally { setSaving(false) }
  }

  const hasTeams = !!homeTeam && !!awayTeam

  return (
    <div className={`match-card${match?.completed ? ' completed' : ''}`}>
      {/* header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10">
        <span className="text-xs text-slate-400 font-medium">{f.match_time} · {f.venue}</span>
        {match?.completed && (
          <div className="flex items-center gap-2">
            {match.extra_time_or_penalties && <span className="text-[11px] font-bold text-amber-400 bg-amber-500/20 px-1.5 py-px rounded-md">AET/P</span>}
            <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/20 px-1.5 py-px rounded-md flex items-center gap-1">
              <Check size={10} strokeWidth={3} /> FT
            </span>
          </div>
        )}
      </div>

      {/* body */}
      <div className="flex items-center gap-3 px-4 py-3.5">
        <div className="flex-1 text-right min-w-0">
          <p className={`text-sm font-bold truncate ${hasTeams ? 'text-white' : 'text-slate-500'}`}>
            {homeTeam?.team_name ?? `Slot ${f.slot_home}`}
          </p>
          {homeTeam?.owner && <p className="text-xs text-slate-400 font-medium">{homeTeam.owner.name}</p>}
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          {isAdmin && match ? (
            <>
              <input type="number" min="0" value={home} onChange={e => setHome(e.target.value)}
                className="w-11 h-10 text-center bg-white/10 border border-white/20 rounded-xl text-white text-base font-bold focus:outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 transition-all tabular-nums" />
              <span className="text-white/30 text-xl">–</span>
              <input type="number" min="0" value={away} onChange={e => setAway(e.target.value)}
                className="w-11 h-10 text-center bg-white/10 border border-white/20 rounded-xl text-white text-base font-bold focus:outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 transition-all tabular-nums" />
            </>
          ) : match?.completed ? (
            <span className="flex items-center gap-1 px-1">
              <span className="text-xl font-black text-white tabular-nums">{match.home_score}</span>
              <span className="text-white/30 text-lg">–</span>
              <span className="text-xl font-black text-white tabular-nums">{match.away_score}</span>
            </span>
          ) : (
            <span className="px-3 text-white/30 text-xs font-medium">vs</span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className={`text-sm font-bold truncate ${hasTeams ? 'text-white' : 'text-slate-500'}`}>
            {awayTeam?.team_name ?? `Slot ${f.slot_away}`}
          </p>
          {awayTeam?.owner && <p className="text-xs text-slate-400 font-medium">{awayTeam.owner.name}</p>}
        </div>
      </div>

      {/* admin controls */}
      {isAdmin && match && (
        <div className="flex items-center justify-between gap-3 px-4 pb-3.5 pt-1 border-t border-white/10">
          <label className="flex items-center gap-1.5 text-xs text-slate-400 cursor-pointer font-medium">
            <input type="checkbox" checked={et} onChange={e => setEt(e.target.checked)} className="accent-[#D4AF37]" />
            AET/P
          </label>
          <button onClick={save} disabled={saving}
            className="px-4 py-1.5 bg-[#D4AF37] hover:bg-[#C4A027] disabled:opacity-40 text-[#071A3D] text-xs font-bold rounded-xl transition-all shadow-sm">
            {saving ? 'Saving…' : match.completed ? 'Update' : 'Save'}
          </button>
        </div>
      )}
    </div>
  )
}

// ─── SlotEditModal ───────────────────────────────────────────

function SlotEditModal({ slotNum, attrKey, onClose }: { slotNum: number; attrKey: keyof Team; onClose: () => void }) {
  const { data: teams = [] } = useTeams()
  const { data: slots = [] } = useBracketSlots()
  const updateSlot = useUpdateBracketSlot()
  const [search, setSearch] = useState('')

  const current = slots.find(s => s.slot_number === slotNum)
  const eligible = teams
    .filter(t => t[attrKey] === true && t.team_name.toLowerCase().includes(search.toLowerCase()))
    .slice(0, 16)

  async function select(teamId: string | null) {
    await updateSlot.mutateAsync({ slotNumber: slotNum, teamId })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-card p-5 w-full max-w-xs">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-bold text-white">Slot {slotNum}</h3>
            <p className="text-xs text-slate-400 mt-0.5 font-medium">Only eligible teams shown</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors mt-0.5">
            <X size={17} />
          </button>
        </div>

        <input
          type="text" placeholder="Search…" value={search}
          onChange={e => setSearch(e.target.value)} autoFocus
          className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 mb-3 transition-all"
        />

        <div className="space-y-0.5 max-h-64 overflow-y-auto">
          {current?.team && (
            <button onClick={() => select(null)}
              className="w-full text-left px-3 py-2 rounded-lg text-xs text-red-400 hover:bg-red-500/10 transition-colors font-semibold">
              ✕ Clear slot
            </button>
          )}
          {eligible.length === 0 && (
            <p className="text-slate-400 text-xs text-center py-5 font-medium">
              Tick the round attribute in "Manage" first.
            </p>
          )}
          {eligible.map(t => (
            <button key={t.id} onClick={() => select(t.id)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors font-medium ${
                current?.team_id === t.id
                  ? 'bg-[#D4AF37]/10 text-[#D4AF37]'
                  : 'text-slate-200 hover:bg-white/10'
              }`}>
              {t.team_name}
              <span className="text-slate-500 text-xs ml-2 font-normal">P{t.pot_number} · {t.owner?.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── ManageRoundsPanel ───────────────────────────────────────

function ManageRoundsPanel({ teams }: { teams: Team[] }) {
  const update = useUpdateTeamAdvancement()
  const [savingId, setSavingId] = useState<string | null>(null)

  async function toggle(team: Team, attr: keyof Team) {
    setSavingId(team.id)
    try { await update.mutateAsync({ teamId: team.id, flags: { [attr]: !team[attr] } }) }
    finally { setSavingId(null) }
  }

  const sorted = [...teams].sort((a, b) => a.team_name.localeCompare(b.team_name))

  return (
    <div className="glass-card overflow-hidden">
      <div className="px-5 py-4 border-b border-white/10 bg-white/5">
        <h2 className="font-bold text-white text-sm">Round Advancement</h2>
        <p className="text-slate-400 text-xs mt-1 font-medium">
          Tick each round a team has reached. Each tick = +1 Round Point.
          A team that wins all rounds earns 6 Round Points total.
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/5 text-slate-400 text-[11px] uppercase tracking-widest">
              <th className="text-left px-5 py-3 font-semibold">Team</th>
              <th className="text-left px-3 py-3 font-semibold hidden sm:table-cell">Owner</th>
              {ROUND_ATTRS.map(a => (
                <th key={String(a.key)} className="text-center px-3 py-3 font-semibold">{a.short}</th>
              ))}
              <th className="text-center px-4 py-3 font-semibold">Pts</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map(team => {
              const busy = savingId === team.id
              const pts = getRoundPoints(team)
              return (
                <tr key={team.id} className={`border-b border-white/10 transition-colors ${busy ? 'opacity-50' : 'hover:bg-white/5'}`}>
                  <td className="px-5 py-2.5 font-semibold text-white">{team.team_name}</td>
                  <td className="px-3 py-2.5 text-slate-400 text-xs hidden sm:table-cell font-medium">{team.owner?.name}</td>
                  {ROUND_ATTRS.map(a => {
                    const ticked = !!team[a.key]
                    return (
                      <td key={String(a.key)} className="px-3 py-2.5 text-center">
                        <button
                          disabled={busy}
                          onClick={() => toggle(team, a.key)}
                          className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center mx-auto transition-all ${
                            ticked
                              ? 'bg-[#D4AF37] border-[#D4AF37] text-[#071A3D] shadow-sm'
                              : 'bg-white/10 border-white/20 text-transparent hover:border-[#D4AF37]/50'
                          } disabled:cursor-not-allowed`}
                          title={`${ticked ? 'Remove' : 'Set'} ${a.label}`}
                        >
                          <Check size={13} strokeWidth={3} />
                        </button>
                      </td>
                    )
                  })}
                  <td className="px-4 py-2.5 text-center">
                    <span className={`text-sm font-bold tabular-nums ${pts > 0 ? 'text-amber-400' : 'text-white/20'}`}>
                      {pts}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── RoundPanel ──────────────────────────────────────────────

function RoundPanel({ round, slots, allMatches, isAdmin, onEdit }: {
  round: typeof ROUNDS[0]
  slots: BracketSlot[]
  allMatches: Match[]
  isAdmin: boolean
  onEdit: (n: number) => void
}) {
  const [min, max] = round.slotRange
  const nums = Array.from({ length: max - min + 1 }, (_, i) => i + min)
  const fixturesByDate = groupByDate(round.key)
  const useDoubleCol = nums.length > 16

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Slots */}
      <div className="glass-card p-5">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">{round.label} Slots</h2>
        <div className={`gap-1.5 max-h-[560px] overflow-y-auto pr-1 ${useDoubleCol ? 'grid grid-cols-2' : 'flex flex-col'}`}>
          {nums.map(n => (
            <SlotCell key={n} n={n} slots={slots} isAdmin={isAdmin} onEdit={onEdit} />
          ))}
        </div>
      </div>

      {/* Fixtures */}
      <div>
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">{round.label} Fixtures</h2>
        {fixturesByDate.size === 0 ? (
          <div className="glass-card p-10 text-center text-slate-400">
            <GitBranch size={28} className="mx-auto mb-3 opacity-20" />
            <p className="text-sm font-medium">No fixtures scheduled</p>
          </div>
        ) : (
          <div className="space-y-5 max-h-[600px] overflow-y-auto pr-1">
            {Array.from(fixturesByDate.entries()).map(([date, fixtures]) => (
              <div key={date}>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                  {format(parseISO(date), 'EEEE, MMMM d')}
                </p>
                <div className="space-y-2.5">
                  {fixtures.map((f, i) => (
                    <FixtureCard key={i} f={f} slots={slots} allMatches={allMatches} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── BracketPage ─────────────────────────────────────────────

export default function BracketPage() {
  const { role } = useAuth()
  const { data: slots = [], isLoading: slotsLoading } = useBracketSlots()
  const { data: allMatches = [], isLoading: matchesLoading } = useAllMatches()
  const { data: teams = [], isLoading: teamsLoading } = useTeams()
  const [activeTab, setActiveTab] = useState<string>('round_of_32')
  const [editingSlot, setEditingSlot] = useState<number | null>(null)

  const isAdmin = role === 'admin'
  if (slotsLoading || matchesLoading || teamsLoading) return <LoadingSpinner text="Loading bracket…" />

  const activeRound = ROUNDS.find(r => r.key === activeTab)

  const tabs = [
    ...ROUNDS.map(r => ({ key: r.key, label: r.label, manage: false })),
    ...(isAdmin ? [{ key: 'manage', label: 'Manage', manage: true }] : []),
  ]

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">

      {/* Header */}
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
          <GitBranch size={22} className="text-[#D4AF37]" />
          Knockout Bracket
        </h1>
        <p className="text-[#64748B] text-sm mt-1 font-medium">
          Each round reached = +1 Round Point · Winner earns 6 Round Points total.
          {isAdmin && ' Use "Manage" to set attributes and ✎ to assign teams to slots.'}
        </p>
      </div>

      {/* Round points key */}
      <div className="flex gap-2 flex-wrap mb-7">
        {ROUND_ATTRS.map(a => (
          <div key={String(a.key)} className="flex items-center gap-1.5 bg-[#0E2A5A] border border-white/10 rounded-xl px-3 py-2 text-xs">
            <Trophy size={10} className="text-[#D4AF37] flex-shrink-0" />
            <span className="text-white font-bold">{a.short}</span>
            <span className="text-slate-400 font-medium">= {a.pts}pt{a.pts > 1 ? 's' : ''}</span>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 overflow-x-auto scrollbar-hide mb-8 pb-1">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              activeTab === t.key
                ? 'bg-[#D4AF37] text-[#071A3D] shadow-lg shadow-[#D4AF37]/25'
                : 'bg-[#0E2A5A] text-slate-300 hover:bg-[#D4AF37]/15 hover:text-white border border-white/10'
            }`}
          >
            {t.manage && <Settings size={13} />}
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'manage'
        ? <ManageRoundsPanel teams={teams} />
        : activeRound
          ? <RoundPanel round={activeRound} slots={slots} allMatches={allMatches} isAdmin={isAdmin} onEdit={setEditingSlot} />
          : null}

      {editingSlot !== null && activeRound && (
        <SlotEditModal slotNum={editingSlot} attrKey={activeRound.attrKey} onClose={() => setEditingSlot(null)} />
      )}
    </div>
  )
}
