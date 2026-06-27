import type { Match, Team } from '../types'

export function getPotMultiplier(potDiff: number): number {
  const multipliers: Record<number, number> = { 1: 1.2, 2: 1.4, 3: 1.6, 4: 1.8, 5: 2.0 }
  return multipliers[Math.min(potDiff, 5)] ?? 1.0
}

export interface MatchPoints {
  homePoints: number
  awayPoints: number
  homeGoalBonus: number
  awayGoalBonus: number
}

export function calculateGroupMatchPoints(
  homeScore: number,
  awayScore: number,
  homePot: number,
  awayPot: number
): MatchPoints {
  const potDiff = Math.abs(homePot - awayPot)
  const multiplier = potDiff > 0 ? getPotMultiplier(potDiff) : 1.0
  const lowerPotTeam = homePot > awayPot ? 'home' : homePot < awayPot ? 'away' : null

  let homeBase = 0
  let awayBase = 0

  if (homeScore > awayScore) {
    homeBase = 3
    awayBase = 0
  } else if (homeScore < awayScore) {
    homeBase = 0
    awayBase = 3
  } else {
    homeBase = 1
    awayBase = 1
  }

  const homeGoalBonus = homeScore * 0.1
  const awayGoalBonus = awayScore * 0.1

  let homePoints = homeBase + homeGoalBonus
  let awayPoints = awayBase + awayGoalBonus

  if (lowerPotTeam === 'home' && potDiff > 0) {
    homePoints = (homeBase + homeGoalBonus) * multiplier
    awayPoints = awayBase + awayGoalBonus
  } else if (lowerPotTeam === 'away' && potDiff > 0) {
    homePoints = homeBase + homeGoalBonus
    awayPoints = (awayBase + awayGoalBonus) * multiplier
  }

  return {
    homePoints: Math.round(homePoints * 100) / 100,
    awayPoints: Math.round(awayPoints * 100) / 100,
    homeGoalBonus: Math.round(homeGoalBonus * 100) / 100,
    awayGoalBonus: Math.round(awayGoalBonus * 100) / 100,
  }
}

export function calculateKnockoutMatchPoints(
  homeScore: number,
  awayScore: number,
  homePot: number,
  awayPot: number,
  extraTimeOrPenalties: boolean
): MatchPoints {
  const potDiff = Math.abs(homePot - awayPot)
  const multiplier = potDiff > 0 ? getPotMultiplier(potDiff) : 1.0
  const lowerPotTeam = homePot > awayPot ? 'home' : homePot < awayPot ? 'away' : null

  let homeBase = 0
  let awayBase = 0

  if (homeScore > awayScore) {
    homeBase = extraTimeOrPenalties ? 2 : 3
    awayBase = extraTimeOrPenalties ? 1 : 0
  } else if (homeScore < awayScore) {
    homeBase = extraTimeOrPenalties ? 1 : 0
    awayBase = extraTimeOrPenalties ? 2 : 3
  } else {
    homeBase = 0
    awayBase = 0
  }

  const homeGoalBonus = homeScore * 0.1
  const awayGoalBonus = awayScore * 0.1

  let homePoints = homeBase + homeGoalBonus
  let awayPoints = awayBase + awayGoalBonus

  if (lowerPotTeam === 'home' && potDiff > 0) {
    homePoints = (homeBase + homeGoalBonus) * multiplier
    awayPoints = awayBase + awayGoalBonus
  } else if (lowerPotTeam === 'away' && potDiff > 0) {
    homePoints = homeBase + homeGoalBonus
    awayPoints = (awayBase + awayGoalBonus) * multiplier
  }

  return {
    homePoints: Math.round(homePoints * 100) / 100,
    awayPoints: Math.round(awayPoints * 100) / 100,
    homeGoalBonus: Math.round(homeGoalBonus * 100) / 100,
    awayGoalBonus: Math.round(awayGoalBonus * 100) / 100,
  }
}

export function calculateTeamStandings(teams: Team[], matches: Match[]) {
  return teams
    .map(team => {
      const teamMatches = matches.filter(
        m => m.completed && (m.home_team_id === team.id || m.away_team_id === team.id) && m.stage === 'group'
      )
      const played = teamMatches.length
      let points = 0
      let goalsScored = 0
      let goalsConceded = 0

      teamMatches.forEach(m => {
        if (m.home_score === null || m.away_score === null) return
        const isHome = m.home_team_id === team.id
        const teamScore = isHome ? m.home_score : m.away_score
        const oppScore = isHome ? m.away_score : m.home_score
        goalsScored += teamScore
        goalsConceded += oppScore

        const homeTeam = m.home_team
        const awayTeam = m.away_team
        if (!homeTeam || !awayTeam) return

        const { homePoints, awayPoints } = calculateGroupMatchPoints(
          m.home_score, m.away_score, homeTeam.pot_number, awayTeam.pot_number
        )
        points += isHome ? homePoints : awayPoints
      })

      return {
        team,
        played,
        points: Math.round(points * 100) / 100,
        goals_scored: goalsScored,
        goals_conceded: goalsConceded,
        goal_difference: goalsScored - goalsConceded,
        rank: 0,
      }
    })
    .sort((a, b) => b.points - a.points || b.goal_difference - a.goal_difference)
    .map((s, i) => ({ ...s, rank: i + 1 }))
}

export function formatPoints(pts: number): string {
  return pts.toFixed(2).replace(/\.?0+$/, '') || '0'
}
