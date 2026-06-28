import { useState, useMemo } from 'react'
import { useBracketSlots, useUpdateBracketSlot } from '../hooks/useBracket'
import { useTeams, useUpdateTeamAdvancement } from '../hooks/useTeams'
import { useAuth } from '../context/AuthContext'
import LoadingSpinner from '../components/LoadingSpinner'
import FlagImg from '../components/FlagImg'
import { GitBranch, Check, X, Trophy, Settings, Star } from 'lucide-react'
import worldCupImg from '../assets/World Cup.png'
import type { Team, BracketSlot } from '../types'

// ─── Round advancement config ─────────────────────────────────

const ROUND_ATTRS: { key: keyof Team; short: string; label: string; pts: number }[] = [
  { key: 'round_of_32',  short: 'R32',   label: 'Round of 32',   pts: 1 },
  { key: 'round_of_16',  short: 'R16',   label: 'Round of 16',   pts: 2 },
  { key: 'quarterfinal', short: 'QF',    label: 'Quarterfinals', pts: 3 },
  { key: 'semifinal',    short: 'SF',    label: 'Semifinals',    pts: 4 },
  { key: 'final_round',  short: 'Final', label: 'Final',         pts: 5 },
  { key: 'winner',       short: 'W',     label: 'Winner',        pts: 6 },
]

// ─── Visual bracket layout constants ─────────────────────────

const CW = 148   // card width
const SH = 34    // slot height
const CH = SH * 2 + 1   // card height = 69
const MG = 10    // gap between adjacent R32 match cards
const U  = CH + MG      // base vertical unit = 79
const RG = 32    // horizontal gap between round columns
const CS = CW + RG      // column step = 180
const VPad = 16  // vertical padding top/bottom
const VW = 9 * CS - RG          // total svg width  = 1588
const VH = VPad * 2 + 8 * U - MG  // total svg height = 654

// Y position (top of card) for a match at a given bracket round and index
function vy(round: number, idx: number): number {
  const p = Math.pow(2, round)
  return Math.round(VPad + idx * U * p + (p - 1) * U / 2)
}

// Which round attr does a slot number correspond to?
function slotAttrKey(n: number): keyof Team {
  if (n <= 32) return 'round_of_32'
  if (n <= 48) return 'round_of_16'
  if (n <= 56) return 'quarterfinal'
  if (n <= 60) return 'semifinal'
  return 'final_round'
}

type BMatch = { col: number; round: number; idx: number; home: number; away: number }

const LEFT_MATCHES: BMatch[] = [
  { col:0, round:0, idx:0, home:1,  away:2  },
  { col:0, round:0, idx:1, home:3,  away:4  },
  { col:0, round:0, idx:2, home:5,  away:6  },
  { col:0, round:0, idx:3, home:7,  away:8  },
  { col:0, round:0, idx:4, home:9,  away:10 },
  { col:0, round:0, idx:5, home:11, away:12 },
  { col:0, round:0, idx:6, home:13, away:14 },
  { col:0, round:0, idx:7, home:15, away:16 },
  { col:1, round:1, idx:0, home:33, away:34 },
  { col:1, round:1, idx:1, home:35, away:36 },
  { col:1, round:1, idx:2, home:37, away:38 },
  { col:1, round:1, idx:3, home:39, away:40 },
  { col:2, round:2, idx:0, home:49, away:50 },
  { col:2, round:2, idx:1, home:51, away:52 },
  { col:3, round:3, idx:0, home:57, away:58 },
]

const RIGHT_MATCHES: BMatch[] = [
  { col:8, round:0, idx:0, home:17, away:18 },
  { col:8, round:0, idx:1, home:19, away:20 },
  { col:8, round:0, idx:2, home:21, away:22 },
  { col:8, round:0, idx:3, home:23, away:24 },
  { col:8, round:0, idx:4, home:25, away:26 },
  { col:8, round:0, idx:5, home:27, away:28 },
  { col:8, round:0, idx:6, home:29, away:30 },
  { col:8, round:0, idx:7, home:31, away:32 },
  { col:7, round:1, idx:0, home:41, away:42 },
  { col:7, round:1, idx:1, home:43, away:44 },
  { col:7, round:1, idx:2, home:45, away:46 },
  { col:7, round:1, idx:3, home:47, away:48 },
  { col:6, round:2, idx:0, home:53, away:54 },
  { col:6, round:2, idx:1, home:55, away:56 },
  { col:5, round:3, idx:0, home:59, away:60 },
]

// SVG connector paths for one half of the bracket
function bracketConnectors(side: 'left' | 'right'): string[] {
  const paths: string[] = []
  const isLeft = side === 'left'

  // Rounds 0→1 (R32→R16), 1→2 (R16→QF), 2→3 (QF→SF)
  for (let r = 0; r < 3; r++) {
    const pairs = 4 >> r  // 4, 2, 1
    for (let j = 0; j < pairs; j++) {
      const y1 = vy(r, 2 * j) + CH / 2
      const y2 = vy(r, 2 * j + 1) + CH / 2
      const yc = (y1 + y2) / 2
      let x1: number, x2: number, mx: number
      if (isLeft) {
        x1 = r * CS + CW        // right edge of parent card
        x2 = (r + 1) * CS       // left edge of child card
        mx = x1 + RG / 2
      } else {
        x1 = (8 - r) * CS       // left edge of parent card (right bracket)
        x2 = (7 - r) * CS + CW  // right edge of child card
        mx = x2 + RG / 2
      }
      // Bracket arm: connects right/left of two parent cards with a bracket shape
      paths.push(`M ${x1} ${y1} H ${mx} V ${y2} H ${x1}`)
      // Horizontal line to child
      paths.push(`M ${mx} ${yc} H ${x2}`)
    }
  }

  // SF → Final connector (horizontal line)
  const ySF = vy(3, 0) + CH / 2
  if (isLeft) {
    paths.push(`M ${3 * CS + CW} ${ySF} H ${4 * CS}`)
  } else {
    paths.push(`M ${5 * CS} ${ySF} H ${4 * CS + CW}`)
  }

  return paths
}

// ─── Helpers ─────────────────────────────────────────────────

function getRoundPoints(team: Team) {
  return ROUND_ATTRS.reduce((sum, a) => sum + (team[a.key] ? 1 : 0), 0)
}

function getTeamInSlot(n: number, slots: BracketSlot[]): Team | undefined {
  return slots.find(s => s.slot_number === n)?.team ?? undefined
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
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors mt-0.5"><X size={17} /></button>
        </div>
        <input type="text" placeholder="Search…" value={search}
          onChange={e => setSearch(e.target.value)} autoFocus
          className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 mb-3 transition-all" />
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
                current?.team_id === t.id ? 'bg-[#D4AF37]/10 text-[#D4AF37]' : 'text-slate-200 hover:bg-white/10'
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
  const [saveError, setSaveError] = useState<string | null>(null)

  async function toggle(team: Team, attr: keyof Team) {
    setSavingId(team.id)
    setSaveError(null)
    try {
      await update.mutateAsync({
        teamId: team.id,
        flags: { [attr]: !team[attr] } as Partial<Pick<Team, 'round_of_32' | 'round_of_16' | 'quarterfinal' | 'semifinal' | 'final_round' | 'winner'>>,
      })
    } catch (err: any) {
      setSaveError(err?.message ?? 'Save failed. Check Supabase RLS: teams table needs UPDATE policy for anon role.')
    } finally {
      setSavingId(null)
    }
  }

  const sorted = [...teams].sort((a, b) => a.team_name.localeCompare(b.team_name))

  return (
    <div className="glass-card overflow-hidden">
      <div className="px-5 py-4 border-b border-white/10 bg-white/5">
        <h2 className="font-bold text-white text-sm">Round Advancement</h2>
        <p className="text-slate-400 text-xs mt-1 font-medium">
          Tick each round a team has reached. Each tick = +1 Round Point.
        </p>
      </div>
      {saveError && (
        <div className="px-5 py-2 bg-red-500/10 border-b border-red-500/20 text-red-400 text-xs font-medium">
          ⚠ {saveError}
        </div>
      )}
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
                    <span className={`text-sm font-bold tabular-nums ${pts > 0 ? 'text-amber-400' : 'text-white/20'}`}>{pts}</span>
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

// ─── VBMatchCard (visual bracket match card) ──────────────────

function VBMatchCard({ slots, home, away, isAdmin, onEdit }: {
  slots: BracketSlot[]
  home: number
  away: number
  isAdmin: boolean
  onEdit: (n: number) => void
}) {
  const homeTeam = getTeamInSlot(home, slots)
  const awayTeam = getTeamInSlot(away, slots)

  return (
    <div style={{ width: CW, height: CH, background: 'rgba(7,26,61,0.92)' }}
      className="border border-[#D4AF37]/40 rounded-lg overflow-hidden shadow-lg shadow-[#D4AF37]/5">
      {/* Home slot */}
      <div style={{ height: SH }}
        onClick={() => isAdmin && onEdit(home)}
        className={`flex items-center gap-1.5 px-2 transition-colors ${isAdmin ? 'cursor-pointer hover:bg-[#D4AF37]/10' : ''} ${homeTeam ? 'bg-[#D4AF37]/5' : ''}`}>
        <span className="text-[9px] text-[#D4AF37]/40 font-mono w-5 flex-shrink-0 tabular-nums">{home}</span>
        <span className={`text-[11px] font-semibold truncate flex-1 ${homeTeam ? 'text-white' : 'text-slate-600'}`}>
          {homeTeam?.team_name ?? 'TBD'}
        </span>
        {homeTeam && <span className="text-[9px] text-slate-500 truncate hidden" style={{ maxWidth: 40 }}>{homeTeam.owner?.name}</span>}
      </div>
      {/* Divider */}
      <div className="h-px bg-[#D4AF37]/20" />
      {/* Away slot */}
      <div style={{ height: SH }}
        onClick={() => isAdmin && onEdit(away)}
        className={`flex items-center gap-1.5 px-2 transition-colors ${isAdmin ? 'cursor-pointer hover:bg-[#D4AF37]/10' : ''} ${awayTeam ? 'bg-[#D4AF37]/5' : ''}`}>
        <span className="text-[9px] text-[#D4AF37]/40 font-mono w-5 flex-shrink-0 tabular-nums">{away}</span>
        <span className={`text-[11px] font-semibold truncate flex-1 ${awayTeam ? 'text-white' : 'text-slate-600'}`}>
          {awayTeam?.team_name ?? 'TBD'}
        </span>
      </div>
    </div>
  )
}

// ─── Confetti ────────────────────────────────────────────────

const CONFETTI_COLORS = [
  '#D4AF37','#FFD700','#FF6B6B','#FF4444','#4FC3F7',
  '#29B6F6','#81C784','#66BB6A','#F48FB1','#FF80AB',
  '#FFB74D','#FFA726','#CE93D8','#AB47BC','#ffffff',
]

// Pre-generate pieces outside component so they're stable across re-renders
const CONFETTI_PIECES = Array.from({ length: 130 }, (_, i) => {
  const r = Math.random
  return {
    id: i,
    left: r() * 100,
    w: 5 + r() * 10,
    h: r() > 0.35 ? 12 + r() * 16 : 5 + r() * 8,   // ribbons vs squares
    color: CONFETTI_COLORS[Math.floor(r() * CONFETTI_COLORS.length)],
    delay: r() * 5,
    dur: 3.5 + r() * 3,
    rot: r() * 360,
    isCircle: r() > 0.65,
  }
})

function Confetti() {
  return (
    /* z-index 1100: above the winner overlay (1000) so confetti shows over it */
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 1100, overflow: 'hidden' }}>
      <style>{`
        @keyframes cfall {
          0%   { transform: translateY(-30px) rotate(0deg);   opacity: 1; }
          20%  { opacity: 1; }
          80%  { opacity: 0.9; }
          100% { transform: translateY(108vh) rotate(900deg); opacity: 0; }
        }
      `}</style>
      {CONFETTI_PIECES.map(p => (
        <div key={p.id} style={{
          position: 'absolute',
          left: `${p.left}%`,
          top: 0,
          width: p.w,
          height: p.isCircle ? p.w : p.h,
          backgroundColor: p.color,
          borderRadius: p.isCircle ? '50%' : '2px',
          transform: `rotate(${p.rot}deg)`,
          animation: `cfall ${p.dur}s ${p.delay}s linear forwards`,
          willChange: 'transform, opacity',
        }} />
      ))}
    </div>
  )
}

// ─── WinnerShowcase ───────────────────────────────────────────

function WinnerShowcase({ winner, onClose }: { winner: Team; onClose: () => void }) {
  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(2,8,22,0.88)', backdropFilter: 'blur(10px)',
        padding: 16,
      }}
      onClick={onClose}
    >
      <style>{`
        @keyframes cardDrop {
          0%   { transform: perspective(900px) translateY(-110vh) rotateY(0deg)    scale(0.25); opacity: 0; }
          55%  { transform: perspective(900px) translateY(22px)   rotateY(1080deg) scale(1.09); opacity: 1; }
          70%  { transform: perspective(900px) translateY(-11px)  rotateY(1080deg) scale(0.95); }
          82%  { transform: perspective(900px) translateY(7px)    rotateY(1080deg) scale(1.03); }
          91%  { transform: perspective(900px) translateY(-3px)   rotateY(1080deg) scale(0.99); }
          100% { transform: perspective(900px) translateY(0)      rotateY(1080deg) scale(1);    opacity: 1; }
        }
        @keyframes trophyPop {
          0%   { transform: scale(0) rotate(-180deg); opacity: 0; filter: brightness(4) drop-shadow(0 0 40px #FFD700); }
          55%  { transform: scale(1.18) rotate(12deg); opacity: 1; filter: brightness(2) drop-shadow(0 0 24px #D4AF37); }
          75%  { transform: scale(0.93) rotate(-6deg); }
          90%  { transform: scale(1.04) rotate(3deg); }
          100% { transform: scale(1) rotate(0deg); opacity: 1; filter: drop-shadow(0 0 16px rgba(212,175,55,0.85)); }
        }
        @keyframes trophyFloat {
          0%,100% { transform: translateY(0) scale(1); }
          50%     { transform: translateY(-12px) scale(1.04); }
        }
        @keyframes titleReveal {
          0%   { transform: scale(0.4) translateY(-16px); opacity: 0; letter-spacing: 0.05em; }
          60%  { transform: scale(1.08) translateY(2px);  opacity: 1; }
          100% { transform: scale(1) translateY(0);       opacity: 1; }
        }
        @keyframes slideUp {
          0%   { transform: translateY(24px); opacity: 0; }
          100% { transform: translateY(0);   opacity: 1; }
        }
        @keyframes goldPulse {
          0%,100% { box-shadow: 0 0 40px 10px rgba(212,175,55,0.45), 0 0 80px 30px rgba(212,175,55,0.2); }
          50%     { box-shadow: 0 0 90px 24px rgba(212,175,55,0.75), 0 0 180px 60px rgba(212,175,55,0.35); }
        }
        @keyframes bgShimmer {
          0%,100% { opacity: 0.08; }
          50%     { opacity: 0.22; }
        }
        @keyframes flashIn {
          0%  { opacity: 0; }
          15% { opacity: 0.45; }
          40% { opacity: 0; }
          100%{ opacity: 0; }
        }
      `}</style>

      {/* One-shot gold screen flash on entry */}
      <div style={{
        position: 'fixed', inset: 0, background: '#D4AF37',
        animation: 'flashIn 0.7s ease-out forwards',
        pointerEvents: 'none', zIndex: 1,
      }} />

      {/* "FIFA World Cup 2026 Champion" label */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20,
        animation: 'titleReveal 0.55s cubic-bezier(0.34,1.56,0.64,1) 0.7s both',
      }}>
        <Star size={14} color="#D4AF37" fill="#D4AF37" />
        <span style={{
          color: '#D4AF37', fontSize: 11, fontWeight: 800,
          textTransform: 'uppercase', letterSpacing: '0.3em',
        }}>
          FIFA World Cup 2026 Champion
        </span>
        <Star size={14} color="#D4AF37" fill="#D4AF37" />
      </div>

      {/* Main card — drops & spins in */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          position: 'relative',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18,
          padding: '36px 52px',
          borderRadius: 28,
          border: '2px solid #D4AF37',
          background: 'linear-gradient(155deg, #071A3D 0%, #0D2458 45%, #071A3D 100%)',
          minWidth: 300,
          cursor: 'default',
          animation: 'cardDrop 1.1s cubic-bezier(0.22,1,0.36,1) forwards, goldPulse 2.2s ease-in-out 1.5s infinite',
        }}
      >
        {/* Animated gold shimmer overlay */}
        <div style={{
          position: 'absolute', inset: 0, borderRadius: 28, pointerEvents: 'none',
          background: 'radial-gradient(ellipse at 50% 20%, rgba(212,175,55,0.28) 0%, transparent 68%)',
          animation: 'bgShimmer 3s ease-in-out 1.5s infinite',
        }} />

        {/* World Cup trophy */}
        <img
          src={worldCupImg}
          alt="World Cup Trophy"
          style={{
            height: 148,
            objectFit: 'contain',
            position: 'relative', zIndex: 1,
            animation: 'trophyPop 0.75s cubic-bezier(0.34,1.56,0.64,1) 1s both, trophyFloat 2.8s ease-in-out 2.2s infinite',
          }}
        />

        {/* Country flag + name */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          position: 'relative', zIndex: 1,
          animation: 'slideUp 0.5s ease-out 1.5s both',
        }}>
          <FlagImg teamName={winner.team_name} size={38} />
          <span style={{ fontSize: 34, fontWeight: 900, color: '#fff', lineHeight: 1, letterSpacing: '-0.02em' }}>
            {winner.team_name}
          </span>
        </div>

        {/* Owner */}
        {winner.owner && (
          <div style={{
            position: 'relative', zIndex: 1, fontSize: 13, fontWeight: 600, textAlign: 'center',
            color: 'rgba(212,175,55,0.75)',
            animation: 'slideUp 0.5s ease-out 1.8s both',
          }}>
            Owner: <span style={{ color: '#D4AF37' }}>{winner.owner.name}</span>
          </div>
        )}
      </div>

      {/* Dismiss hint */}
      <p style={{
        marginTop: 24, fontSize: 11, color: 'rgba(148,163,184,0.6)',
        animation: 'slideUp 0.4s ease-out 2.2s both',
      }}>
        Tap anywhere to close
      </p>
    </div>
  )
}

// ─── BracketVisual ────────────────────────────────────────────

const COL_LABELS = ['Round of 32', 'Round of 16', 'Quarters', 'Semis', 'Final', 'Semis', 'Quarters', 'Round of 16', 'Round of 32']
const allConnectors = [...bracketConnectors('left'), ...bracketConnectors('right')]
const finalY = vy(3, 0)

function BracketVisual({ slots, isAdmin, onEdit }: {
  slots: BracketSlot[]
  isAdmin: boolean
  onEdit: (n: number, attr: keyof Team) => void
}) {
  const winner = useMemo(() =>
    [61, 62]
      .map(n => slots.find(s => s.slot_number === n)?.team)
      .find(t => t?.winner)
  , [slots])

  // Show overlay on every page open if there's a winner
  const [showOverlay, setShowOverlay] = useState(true)

  return (
    <div className="overflow-x-auto pb-6 -mx-4 px-4">
      {/* Round column labels */}
      <div style={{ width: VW, display: 'grid', gridTemplateColumns: `repeat(9, ${CW}px)`, columnGap: RG, marginBottom: 10 }}>
        {COL_LABELS.map((label, i) => (
          <div key={i} className="text-center text-[9px] font-bold text-[#D4AF37]/50 uppercase tracking-wider truncate">{label}</div>
        ))}
      </div>

      {/* Bracket container */}
      <div style={{ position: 'relative', width: VW, height: VH }}>
        {/* SVG connector lines */}
        <svg style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} width={VW} height={VH}>
          {allConnectors.map((d, i) => (
            <path key={i} d={d} fill="none" stroke="rgba(212,175,55,0.35)" strokeWidth="1.5" strokeLinecap="round" />
          ))}
        </svg>

        {/* Left bracket cards */}
        {LEFT_MATCHES.map(m => (
          <div key={`l${m.col}${m.idx}`} style={{ position: 'absolute', left: m.col * CS, top: vy(m.round, m.idx) }}>
            <VBMatchCard slots={slots} home={m.home} away={m.away} isAdmin={isAdmin}
              onEdit={n => onEdit(n, slotAttrKey(n))} />
          </div>
        ))}

        {/* Right bracket cards */}
        {RIGHT_MATCHES.map(m => (
          <div key={`r${m.col}${m.idx}`} style={{ position: 'absolute', left: m.col * CS, top: vy(m.round, m.idx) }}>
            <VBMatchCard slots={slots} home={m.home} away={m.away} isAdmin={isAdmin}
              onEdit={n => onEdit(n, slotAttrKey(n))} />
          </div>
        ))}

        {/* Final */}
        <div style={{ position: 'absolute', left: 4 * CS, top: finalY }}>
          <div className="flex flex-col items-center gap-1.5">
            <VBMatchCard slots={slots} home={61} away={62} isAdmin={isAdmin}
              onEdit={n => onEdit(n, slotAttrKey(n))} />
            <div className="flex items-center gap-1 text-[#D4AF37] text-[10px] font-bold">
              <Trophy size={10} /> FINAL
            </div>
          </div>
        </div>
      </div>

      {/* Winner overlay — pops up centered on every page open */}
      {winner && showOverlay && (
        <>
          <Confetti />
          <WinnerShowcase winner={winner} onClose={() => setShowOverlay(false)} />
        </>
      )}
    </div>
  )
}

// ─── BracketPage ─────────────────────────────────────────────

export default function BracketPage() {
  const { role } = useAuth()
  const { data: slots = [], isLoading: slotsLoading } = useBracketSlots()
  const { data: teams = [], isLoading: teamsLoading } = useTeams()
  const [activeTab, setActiveTab] = useState<'bracket' | 'manage'>('bracket')
  const [editingSlot, setEditingSlot] = useState<number | null>(null)
  const [editingAttr, setEditingAttr] = useState<keyof Team>('round_of_32')

  const isAdmin = role === 'admin'
  if (slotsLoading || teamsLoading) return <LoadingSpinner text="Loading bracket…" />

  const tabs = [
    { key: 'bracket' as const, label: 'Bracket View' },
    ...(isAdmin ? [{ key: 'manage' as const, label: 'Manage' }] : []),
  ]

  function handleVisualEdit(n: number, attr: keyof Team) {
    setEditingSlot(n)
    setEditingAttr(attr)
  }

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
          {isAdmin && ' Click any slot in the bracket to assign a team.'}
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

      {/* Tabs (only shown for admin, who has the Manage tab) */}
      {isAdmin && (
        <div className="flex gap-1.5 mb-8">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                activeTab === t.key
                  ? 'bg-[#D4AF37] text-[#071A3D] shadow-lg shadow-[#D4AF37]/25'
                  : 'bg-[#0E2A5A] text-slate-300 hover:bg-[#D4AF37]/15 hover:text-white border border-white/10'
              }`}>
              {t.key === 'manage' && <Settings size={13} />}
              {t.label}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      {activeTab === 'manage'
        ? <ManageRoundsPanel teams={teams} />
        : <BracketVisual slots={slots} isAdmin={isAdmin} onEdit={handleVisualEdit} />}

      {editingSlot !== null && (
        <SlotEditModal slotNum={editingSlot} attrKey={editingAttr} onClose={() => setEditingSlot(null)} />
      )}
    </div>
  )
}
