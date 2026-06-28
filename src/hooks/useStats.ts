import { useMemo, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getAllMatches, upsertOwnerRankings } from '../lib/api'
import { useTeams } from './useTeams'
import { calculateGroupMatchPoints, calculateKnockoutMatchPoints } from '../utils/calculations'

export function useAllMatchesForStats() {
  return useQuery({ queryKey: ['matches'], queryFn: getAllMatches })
}

export interface TeamStats {
  teamId: string
  teamName: string
  groupName: string | null
  potNumber: number
  ownerId: string
  ownerName: string
  gamesPlayed: number
  goalsScored: number
  goalsConceded: number
  goalDifference: number
  matchPoints: number
  roundPoints: number
  totalPoints: number
}

export interface OwnerStats {
  ownerId: string
  ownerName: string
  gamesPlayed: number
  goalsScored: number
  goalsConceded: number
  goalDifference: number
  matchPoints: number
  roundPoints: number
  totalPoints: number
  pointsPerGame: number
}

export function useComputedStats() {
  const { data: matches = [], isLoading: matchesLoading } = useAllMatchesForStats()
  const { data: teams = [],   isLoading: teamsLoading   } = useTeams()

  const teamStats: TeamStats[] = useMemo(() => {
    const statsMap = new Map<string, TeamStats>()

    for (const t of teams) {
      const roundPoints =
        (t.round_of_32  ? 1 : 0) +
        (t.round_of_16  ? 1 : 0) +
        (t.quarterfinal ? 1 : 0) +
        (t.semifinal    ? 1 : 0) +
        (t.final_round  ? 1 : 0) +
        (t.winner       ? 1 : 0)

      statsMap.set(t.id, {
        teamId:        t.id,
        teamName:      t.team_name,
        groupName:     (t as any).group_name ?? null,
        potNumber:     t.pot_number,
        ownerId:       t.owner_id,
        ownerName:     t.owner?.name ?? '',
        gamesPlayed:   0,
        goalsScored:   0,
        goalsConceded: 0,
        goalDifference: 0,
        matchPoints:   0,
        roundPoints,
        totalPoints:   roundPoints,
      })
    }

    for (const m of matches) {
      if (!m.completed || m.home_score === null || m.away_score === null) continue
      const home = m.home_team
      const away = m.away_team
      if (!home || !away) continue

      const isGroup = m.stage === 'group'
      const { homePoints, awayPoints } = isGroup
        ? calculateGroupMatchPoints(m.home_score, m.away_score, home.pot_number, away.pot_number)
        : calculateKnockoutMatchPoints(m.home_score, m.away_score, home.pot_number, away.pot_number, m.extra_time_or_penalties, m.penalty_winner ?? null)

      const h = statsMap.get(home.id)
      if (h) {
        h.gamesPlayed   += 1
        h.goalsScored   += m.home_score
        h.goalsConceded += m.away_score
        h.matchPoints    = Math.round((h.matchPoints + homePoints) * 100) / 100
        h.totalPoints    = Math.round((h.matchPoints + h.roundPoints) * 100) / 100
      }

      const a = statsMap.get(away.id)
      if (a) {
        a.gamesPlayed   += 1
        a.goalsScored   += m.away_score
        a.goalsConceded += m.home_score
        a.matchPoints    = Math.round((a.matchPoints + awayPoints) * 100) / 100
        a.totalPoints    = Math.round((a.matchPoints + a.roundPoints) * 100) / 100
      }
    }

    for (const s of statsMap.values()) {
      s.goalDifference = s.goalsScored - s.goalsConceded
    }

    return Array.from(statsMap.values())
      .sort((a, b) => b.totalPoints - a.totalPoints || b.goalDifference - a.goalDifference || b.goalsScored - a.goalsScored)
  }, [matches, teams])

  const ownerStats: OwnerStats[] = useMemo(() => {
    const ownerMap = new Map<string, OwnerStats>()

    for (const t of teamStats) {
      if (!t.ownerId) continue
      const o = ownerMap.get(t.ownerId) ?? {
        ownerId:       t.ownerId,
        ownerName:     t.ownerName,
        gamesPlayed:   0,
        goalsScored:   0,
        goalsConceded: 0,
        goalDifference: 0,
        matchPoints:   0,
        roundPoints:   0,
        totalPoints:   0,
        pointsPerGame: 0,
      }
      o.gamesPlayed   += t.gamesPlayed
      o.goalsScored   += t.goalsScored
      o.goalsConceded += t.goalsConceded
      o.matchPoints    = Math.round((o.matchPoints + t.matchPoints) * 100) / 100
      o.roundPoints    = Math.round((o.roundPoints + t.roundPoints) * 100) / 100
      ownerMap.set(t.ownerId, o)
    }

    return Array.from(ownerMap.values())
      .map(o => ({
        ...o,
        goalDifference: o.goalsScored - o.goalsConceded,
        totalPoints:    Math.round((o.matchPoints + o.roundPoints) * 100) / 100,
        pointsPerGame:  o.gamesPlayed > 0
          ? Math.round((o.matchPoints / o.gamesPlayed) * 100) / 100
          : 0,
      }))
      .sort((a, b) => b.totalPoints - a.totalPoints || b.goalDifference - a.goalDifference || b.goalsScored - a.goalsScored)
  }, [teamStats])

  const isLoading = matchesLoading || teamsLoading

  useEffect(() => {
    if (isLoading || ownerStats.length === 0) return
    upsertOwnerRankings(ownerStats).catch(console.error)
  }, [ownerStats, isLoading])

  return { teamStats, ownerStats, isLoading }
}
