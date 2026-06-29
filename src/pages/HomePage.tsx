import { Link } from 'react-router-dom'
import { useState, useEffect, useMemo } from 'react'
import { Calendar, BarChart3, Users, GitBranch, TrendingUp, Target, Zap } from 'lucide-react'
import { useAllMatchesForStats, useComputedStats } from '../hooks/useStats'
import { useBracketSlots } from '../hooks/useBracket'
import type { Team } from '../types'
import LoadingSpinner from '../components/LoadingSpinner'
import FlagImg from '../components/FlagImg'
import { format, parseISO } from 'date-fns'
import worldCupImg from '../assets/World Cup.png'

const GALAXY_STARS = Array.from({ length: 160 }, (_, i) => {
  const size = Math.random() < 0.82
    ? Math.random() * 1.2 + 0.3
    : Math.random() * 1.6 + 1.4
  return {
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size,
    opacity: Math.random() * 0.45 + 0.12,
    // only 30% of stars twinkle, and very slowly
    twinkle: Math.random() < 0.3,
    duration: Math.random() * 6 + 6,
    delay: Math.random() * 10,
  }
})

const NAV_CARDS = [
  { to: '/fixtures',  label: 'Fixtures',  desc: 'Group stage schedule',   icon: Calendar,  grad: 'from-blue-500 to-blue-700',      glow: 'shadow-blue-500/25'     },
  { to: '/standings', label: 'Standings', desc: 'Team league table',      icon: BarChart3, grad: 'from-emerald-500 to-emerald-700', glow: 'shadow-emerald-500/25'  },
  { to: '/rankings',  label: 'Rankings',  desc: 'Owner leaderboard',      icon: Users,     grad: 'from-violet-500 to-violet-700',   glow: 'shadow-violet-500/25'   },
  { to: '/bracket',   label: 'Bracket',   desc: 'Knockout rounds',        icon: GitBranch, grad: 'from-rose-500 to-rose-700',       glow: 'shadow-rose-500/25'     },
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

export default function HomePage() {
  const { data: matches = [], isLoading: matchLoading } = useAllMatchesForStats()
  const { ownerStats, isLoading: statsLoading } = useComputedStats()
  const { data: slots = [] } = useBracketSlots()

  const slotMap = useMemo(() => {
    const m = new Map<number, Team>()
    for (const s of slots) if (s.team) m.set(s.slot_number, s.team)
    return m
  }, [slots])

  const groupMatches = matches.filter(m => m.stage === 'group')
  const knockoutMatches = matches.filter(m => m.stage !== 'group')
  const completedMatches = matches.filter(m => m.completed).length
  const totalGoals = matches.filter(m => m.completed).reduce((s, m) => s + (m.home_score ?? 0) + (m.away_score ?? 0), 0)

  const STATS = [
    { value: '48',                        label: 'Teams',          sub: '6 pots · 12 groups'  },
    { value: '8',                         label: 'Owners',         sub: 'competitors'          },
    { value: completedMatches.toString(), label: 'Matches Played', sub: 'of 104 total'         },
    { value: totalGoals.toString(),       label: 'Goals Scored',   sub: 'total goals'          },
  ]

  const [statIdx, setStatIdx] = useState(0)
  const [statVisible, setStatVisible] = useState(true)

  function goToStat(i: number) {
    if (i === statIdx) return
    setStatVisible(false)
    setTimeout(() => { setStatIdx(i); setStatVisible(true) }, 320)
  }

  useEffect(() => {
    const id = setInterval(() => {
      setStatVisible(false)
      setTimeout(() => { setStatIdx(i => (i + 1) % 4); setStatVisible(true) }, 320)
    }, 3200)
    return () => clearInterval(id)
  }, [])

  const recentResults = matches
    .filter(m => m.completed)
    .sort((a, b) => b.match_date.localeCompare(a.match_date) || toMinutes(b.match_time) - toMinutes(a.match_time))
    .slice(0, 5)

  // Fall back to knockout fixtures once all group matches are done
  const upcomingGroup = groupMatches.filter(m => !m.completed)
  const upcoming = (upcomingGroup.length > 0 ? upcomingGroup : knockoutMatches.filter(m => !m.completed))
    .sort((a, b) => a.match_date.localeCompare(b.match_date) || toMinutes(a.match_time) - toMinutes(b.match_time))
    .slice(0, 5)

  const STAGE_SHORT: Record<string, string> = {
    round_of_32: 'R32', round_of_16: 'R16', quarterfinal: 'QF', semifinal: 'SF', final: 'Final',
  }
  const matchLabel = (m: typeof upcoming[0]) =>
    m.stage === 'group' ? `Grp ${m.group_name ?? ''}` : (STAGE_SHORT[m.stage] ?? m.stage)

  const slotName = (slot: number | null) => slot ? (slotMap.get(slot)?.team_name ?? `Slot ${slot}`) : 'TBD'

  return (
    <div style={{ background: '#04102A', position: 'relative' }}>

      {/* ── Fixed galaxy — visible behind the entire page ── */}
      <style>{`
        @keyframes starFade {
          0%, 100% { opacity: var(--s-op); }
          50%       { opacity: calc(var(--s-op) * 0.2); }
        }
      `}</style>
      <div style={{ position:'fixed', inset:0, zIndex:0, pointerEvents:'none', overflow:'hidden' }}>
        {/* Nebula clouds */}
        <div style={{ position:'absolute', top:'-5%',  left:'-8%',  width:600, height:500, borderRadius:'50%', background:'rgba(40,55,160,0.18)', filter:'blur(140px)' }} />
        <div style={{ position:'absolute', bottom:'-10%', right:'-5%', width:520, height:460, borderRadius:'50%', background:'rgba(55,35,140,0.14)', filter:'blur(130px)' }} />
        <div style={{ position:'absolute', top:'55%',  left:'60%',  width:420, height:380, borderRadius:'50%', background:'rgba(30,45,130,0.12)', filter:'blur(120px)' }} />
        <div style={{ position:'absolute', top:'30%',  left:'-5%',  width:380, height:340, borderRadius:'50%', background:'rgba(50,30,120,0.11)', filter:'blur(110px)' }} />
        {/* Gold halo stays centred (roughly where the trophy sits in the viewport) */}
        <div style={{ position:'absolute', top:'30%', left:'50%', transform:'translate(-50%,-50%)', width:380, height:380, borderRadius:'50%', background:'radial-gradient(circle, rgba(212,175,55,0.09) 0%, transparent 70%)', filter:'blur(50px)' }} />
        {/* Stars */}
        {GALAXY_STARS.map(s => (
          <div
            key={s.id}
            style={{
              position: 'absolute',
              left: `${s.x}%`,
              top: `${s.y}%`,
              width: s.size,
              height: s.size,
              borderRadius: '50%',
              background: '#ffffff',
              ['--s-op' as string]: s.opacity,
              opacity: s.opacity,
              animation: s.twinkle ? `starFade ${s.duration}s ${s.delay}s ease-in-out infinite` : 'none',
            }}
          />
        ))}
      </div>

      {/* ──────────────── HERO ──────────────── */}
      <section
        className="relative min-h-[94vh] flex flex-col items-center justify-center overflow-hidden"
        style={{ zIndex: 1 }}
      >
        {/* Grid overlay — hero only */}
        <div className="absolute inset-0 hero-grid pointer-events-none" />

        {/* Trophy */}
        <div className="trophy-float mb-8 sm:mb-10 relative z-10 animate-fade-up">
          <div className="absolute inset-0 rounded-full bg-[#D4AF37]/10 blur-3xl scale-[1.8] pointer-events-none" />
          <img
            src={worldCupImg}
            alt="World Cup Trophy"
            className="h-44 sm:h-56 md:h-64 lg:h-72 object-contain trophy-glow relative z-10 hover:scale-[1.04] transition-transform duration-500"
          />
        </div>

        {/* Title */}
        <div className="text-center px-6 z-10 animate-fade-up-d1">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white leading-[1.05] tracking-tight">
            World Cup
            <br />
            <span className="gold-text">Tournament Tracker</span>
          </h1>
        </div>

        {/* Subtitle */}
        <div className="z-10 text-center mt-5 px-6 animate-fade-up-d2">
          <p className="text-[#D4AF37] font-bold text-base sm:text-lg">FIFA World Cup 2026</p>
          <p className="text-white/30 text-sm mt-2 max-w-xs mx-auto leading-relaxed">
            48 teams · 8 owners · 104 matches · One champion
          </p>
        </div>

        {/* CTAs */}
        <div className="z-10 flex items-center gap-3 mt-8 px-6 flex-wrap justify-center animate-fade-up-d2">
          <Link
            to="/rankings"
            className="px-7 py-3 bg-[#D4AF37] text-[#071A3D] rounded-2xl font-bold text-sm hover:bg-[#C4A027] transition-all shadow-xl shadow-[#D4AF37]/25 hover:-translate-y-0.5"
          >
            View Rankings
          </Link>
          <Link
            to="/fixtures"
            className="px-7 py-3 bg-white/8 border border-white/20 text-white rounded-2xl font-semibold text-sm hover:bg-white/15 transition-all hover:-translate-y-0.5 backdrop-blur-sm"
          >
            Fixtures →
          </Link>
        </div>

      </section>

      {/* ──────────────── CONTENT ──────────────── */}
      <div style={{ position: 'relative', zIndex: 1 }}>

        {/* Stats Carousel */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-14 pb-4 flex flex-col items-center">
          <div
            className="text-center select-none"
            style={{
              opacity: statVisible ? 1 : 0,
              transform: statVisible ? 'translateY(0)' : 'translateY(16px)',
              transition: 'opacity 0.32s ease, transform 0.32s ease',
            }}
          >
            <p className="text-8xl sm:text-9xl font-black tabular-nums gold-text leading-none">
              {STATS[statIdx].value}
            </p>
            <p className="text-2xl sm:text-3xl font-bold text-white mt-4 tracking-tight">
              {STATS[statIdx].label}
            </p>
            <p className="text-[#64748B] text-sm mt-1.5 font-medium">
              {STATS[statIdx].sub}
            </p>
          </div>

          {/* Dot / pill indicators */}
          <div className="flex items-center gap-2.5 mt-8">
            {STATS.map((_, i) => (
              <button
                key={i}
                onClick={() => goToStat(i)}
                className={`rounded-full transition-all duration-300 ${
                  i === statIdx
                    ? 'w-8 h-2 bg-[#D4AF37]'
                    : 'w-2 h-2 bg-white/20 hover:bg-white/40'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Navigation links */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-0" style={{ marginTop: '3rem' }}>
          <h2 className="text-2xl font-bold text-white mb-8 tracking-tight text-center">Explore</h2>
          <div className="grid grid-cols-4 gap-4">
            {NAV_CARDS.map(({ to, label, desc, icon: Icon, grad, glow }) => (
              <Link
                key={to}
                to={to}
                className="flex flex-col items-center text-center gap-3 group hover:-translate-y-1 transition-all duration-200"
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${grad} flex items-center justify-center shadow-lg ${glow} group-hover:scale-110 transition-transform duration-200`}>
                  <Icon size={22} className="text-white" />
                </div>
                <div>
                  <p className="font-bold text-white text-[14px]">{label}</p>
                  <p className="text-slate-500 text-xs mt-0.5">{desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Owner Rankings — full width, transparent */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-4" style={{ marginTop: '3rem' }}>
          <div className="flex flex-col items-center mb-5 gap-1.5">
            <h2 className="font-bold text-white flex items-center gap-2 text-2xl">
              <TrendingUp size={20} className="text-[#D4AF37]" />
              Owner Rankings
            </h2>
            <Link to="/rankings" className="text-xs font-semibold text-[#D4AF37] hover:text-[#B8960A] transition-colors">
              View all →
            </Link>
          </div>

          {statsLoading ? <LoadingSpinner /> : (
            <div className="border border-[#D4AF37]/50 rounded-2xl overflow-hidden mx-6" style={{ boxShadow: '0 0 32px 6px rgba(212,175,55,0.18), 0 0 80px 16px rgba(212,175,55,0.08)' }}>
              {ownerStats.map((o, i) => (
                <Link
                  key={o.ownerId}
                  to={`/owners/${o.ownerId}`}
                  className={`flex items-center gap-3 px-4 py-3.5 hover:bg-white/5 transition-colors group ${i !== ownerStats.length - 1 ? 'border-b border-[#D4AF37]/20' : ''}`}
                >
                  <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                    i === 0 ? 'bg-[#D4AF37]/20 text-[#D4AF37]' :
                    i === 1 ? 'bg-white/10 text-slate-300' :
                    i === 2 ? 'bg-orange-500/20 text-orange-400' :
                    'bg-white/8 text-slate-500'
                  }`}>
                    {i + 1}
                  </span>
                  <span className="flex-1 font-semibold text-white text-base group-hover:text-[#D4AF37] transition-colors truncate">
                    {o.ownerName}
                  </span>
                  <div className="text-right flex-shrink-0">
                    <span className="text-[#D4AF37] font-bold text-base tabular-nums">{o.totalPoints.toFixed(2)}</span>
                    <span className="text-slate-500 text-xs ml-1">pts</span>
                  </div>
                </Link>
              ))}
              {!ownerStats.length && (
                <p className="text-slate-500 text-sm py-6 px-4">No rankings yet</p>
              )}
            </div>
          )}
        </div>

        {/* Recent Results + Upcoming Fixtures — side by side */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-16" style={{ marginTop: '3rem', marginBottom: '3rem' }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Recent Results */}
            <div className="rounded-2xl overflow-hidden border border-[#D4AF37]/50 p-5 sm:p-6" style={{ boxShadow: '0 0 32px 6px rgba(212,175,55,0.18), 0 0 80px 16px rgba(212,175,55,0.08)' }}>
              <div className="flex flex-col items-center mb-5 gap-1.5">
                <h2 className="font-bold text-white flex items-center gap-2 text-2xl">
                  <Zap size={20} className="text-[#D4AF37]" />
                  Recent Results
                </h2>
                <Link to="/fixtures" className="text-xs font-semibold text-[#D4AF37] hover:text-[#B8960A] transition-colors">
                  All fixtures →
                </Link>
              </div>

              {matchLoading ? <LoadingSpinner /> : (
                <div className="space-y-0.5">
                  {recentResults.map(m => (
                    <div key={m.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors">
                      <div className="flex-1 flex justify-end items-center gap-1.5 min-w-0">
                        <div className="text-right min-w-0">
                          <p className="text-sm font-semibold text-white truncate">{m.home_team?.team_name}</p>
                          <p className="text-xs text-slate-400 truncate">{m.home_team?.owner?.name}</p>
                        </div>
                        <FlagImg teamName={m.home_team?.team_name ?? ''} size={18} />
                      </div>
                      <div className="text-center flex-shrink-0 min-w-[64px]">
                        <p className="text-white font-bold text-sm tabular-nums">{m.home_score} — {m.away_score}</p>
                        <p className="text-slate-500 text-[10px]">{matchLabel(m)}</p>
                      </div>
                      <div className="flex-1 flex items-center gap-1.5 min-w-0">
                        <FlagImg teamName={m.away_team?.team_name ?? ''} size={18} />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-white truncate">{m.away_team?.team_name}</p>
                          <p className="text-xs text-slate-400 truncate">{m.away_team?.owner?.name}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {!recentResults.length && (
                    <p className="text-slate-500 text-sm text-center py-5">No results yet</p>
                  )}
                </div>
              )}
            </div>

            {/* Upcoming Fixtures */}
            <div className="rounded-2xl overflow-hidden border border-[#D4AF37]/50 p-5 sm:p-6" style={{ boxShadow: '0 0 32px 6px rgba(212,175,55,0.18), 0 0 80px 16px rgba(212,175,55,0.08)' }}>
              <div className="flex flex-col items-center mb-5 gap-1.5">
                <h2 className="font-bold text-white flex items-center gap-2 text-2xl">
                  <Target size={20} className="text-[#D4AF37]" />
                  Upcoming Fixtures
                </h2>
              </div>
              <div className="space-y-0.5">
                {upcoming.map(m => {
                  const homeTeam  = m.home_team ?? (m.home_slot ? slotMap.get(m.home_slot) ?? null : null)
                  const awayTeam  = m.away_team ?? (m.away_slot ? slotMap.get(m.away_slot) ?? null : null)
                  const homeName  = homeTeam?.team_name ?? slotName(m.home_slot)
                  const awayName  = awayTeam?.team_name ?? slotName(m.away_slot)
                  const homeOwner = homeTeam?.owner?.name ?? null
                  const awayOwner = awayTeam?.owner?.name ?? null
                  const homeKnown = !!homeTeam?.team_name
                  const awayKnown = !!awayTeam?.team_name
                  return (
                    <div key={m.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors">
                      <div className="flex-1 flex justify-end items-center gap-1.5 min-w-0">
                        <div className="text-right min-w-0">
                          <p className={`text-sm font-semibold truncate ${homeKnown ? 'text-white' : 'text-slate-500'}`}>{homeName}</p>
                          {homeOwner && <p className="text-xs text-slate-400 truncate">{homeOwner}</p>}
                        </div>
                        {homeKnown && <FlagImg teamName={homeName} size={18} />}
                      </div>
                      <div className="text-center flex-shrink-0 min-w-[80px]">
                        <p className="text-[#D4AF37] text-xs font-semibold">{format(parseISO(m.match_date), 'MMM d')}</p>
                        <p className="text-slate-400 text-[10px] font-medium">{m.match_time}</p>
                        <p className="text-slate-600 text-[10px]">{matchLabel(m)}</p>
                      </div>
                      <div className="flex-1 flex items-center gap-1.5 min-w-0">
                        {awayKnown && <FlagImg teamName={awayName} size={18} />}
                        <div className="min-w-0">
                          <p className={`text-sm font-semibold truncate ${awayKnown ? 'text-white' : 'text-slate-500'}`}>{awayName}</p>
                          {awayOwner && <p className="text-xs text-slate-400 truncate">{awayOwner}</p>}
                        </div>
                      </div>
                    </div>
                  )
                })}
                {!upcoming.length && (
                  <p className="text-slate-500 text-sm text-center py-5">No upcoming fixtures</p>
                )}
              </div>
            </div>

          </div>
        </div>
        {/* Footer credit */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-10 text-center">
          <p className="text-slate-600 text-xs font-medium">
            Designed &amp; Developed by{' '}
            <span className="text-slate-400 font-semibold">Jeeni</span>
            {' '}&amp;{' '}
            <span className="text-slate-400 font-semibold">Achal</span>
          </p>
        </div>

      </div>
    </div>
  )
}
