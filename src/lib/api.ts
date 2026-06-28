import { supabase } from './supabase'
import type { Match, Team, Owner, OwnerRanking, BracketSlot } from '../types'
import type { OwnerStats } from '../hooks/useStats'

export async function getOwners(): Promise<Owner[]> {
  const { data, error } = await supabase.from('owners').select('*').order('name')
  if (error) throw error
  return data || []
}

export async function getTeams(): Promise<Team[]> {
  const { data, error } = await supabase
    .from('teams')
    .select('*, owner:owners(*)')
    .order('team_name')
  if (error) throw error
  return data || []
}

export async function getTeam(id: string): Promise<Team | null> {
  const { data, error } = await supabase
    .from('teams')
    .select('*, owner:owners(*)')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

// Single source of truth — ALL matches with full team+owner joins
export async function getAllMatches(): Promise<Match[]> {
  const { data, error } = await supabase
    .from('matches')
    .select('*, home_team:teams!home_team_id(*, owner:owners(*)), away_team:teams!away_team_id(*, owner:owners(*))')
    .order('match_date', { ascending: true })
    .order('match_time', { ascending: true })
  if (error) throw error
  return data || []
}

export async function getGroupMatches(): Promise<Match[]> {
  const all = await getAllMatches()
  return all.filter(m => m.stage === 'group')
}

export async function getKnockoutMatches(): Promise<Match[]> {
  const all = await getAllMatches()
  return all.filter(m => m.stage !== 'group')
}

export async function updateMatchScore(
  matchId: string,
  homeScore: number,
  awayScore: number,
  extraTimeOrPenalties: boolean,
  completed: boolean
): Promise<void> {
  const { error } = await supabase
    .from('matches')
    .update({
      home_score: homeScore,
      away_score: awayScore,
      extra_time_or_penalties: extraTimeOrPenalties,
      completed,
    })
    .eq('id', matchId)
  if (error) throw error
  // No DB recalculation needed — stats are computed client-side from match data
}

export async function getOwnerRankings(): Promise<OwnerRanking[]> {
  const { data, error } = await supabase
    .from('owner_rankings')
    .select('*, owner:owners(*)')
    .order('total_points', { ascending: false })
    .order('goal_difference', { ascending: false })
  if (error) throw error
  return data || []
}

export async function getBracketSlots(): Promise<BracketSlot[]> {
  const { data, error } = await supabase
    .from('bracket_slots')
    .select('*, team:teams(*, owner:owners(*))')
    .order('slot_number', { ascending: true })
  if (error) throw error
  return data || []
}

export async function updateBracketSlot(slotNumber: number, teamId: string | null): Promise<void> {
  const { error } = await supabase
    .from('bracket_slots')
    .update({ team_id: teamId })
    .eq('slot_number', slotNumber)
  if (error) throw error
}

export async function searchTeams(query: string): Promise<Team[]> {
  const { data, error } = await supabase
    .from('teams')
    .select('*, owner:owners(*)')
    .ilike('team_name', `%${query}%`)
    .limit(10)
  if (error) throw error
  return data || []
}

export async function saveKnockoutScore(
  matchId: string,
  homeTeamId: string | null,
  awayTeamId: string | null,
  homeScore: number,
  awayScore: number,
  extraTimeOrPenalties: boolean,
  completed: boolean
): Promise<void> {
  const { error } = await supabase
    .from('matches')
    .update({
      home_team_id: homeTeamId,
      away_team_id: awayTeamId,
      home_score: homeScore,
      away_score: awayScore,
      extra_time_or_penalties: extraTimeOrPenalties,
      completed,
    })
    .eq('id', matchId)
  if (error) throw error
}

export async function updateTeamAdvancement(
  teamId: string,
  flags: Partial<Pick<Team, 'round_of_32' | 'round_of_16' | 'quarterfinal' | 'semifinal' | 'final_round' | 'winner'>>
): Promise<void> {
  const { error } = await supabase.from('teams').update(flags).eq('id', teamId)
  if (error) throw error
}

export async function upsertOwnerRankings(stats: OwnerStats[]): Promise<void> {
  const rows = stats.map(o => ({
    owner_id:       o.ownerId,
    total_points:   o.totalPoints,
    match_points:   o.matchPoints,
    round_points:   o.roundPoints,
    goal_difference: o.goalDifference,
    goals_scored:   o.goalsScored,
    goals_conceded: o.goalsConceded,
    games_played:   o.gamesPlayed,
    points_per_game: o.pointsPerGame,
    updated_at:     new Date().toISOString(),
  }))
  const { error } = await supabase
    .from('owner_rankings')
    .upsert(rows, { onConflict: 'owner_id' })
  if (error) throw error
}

export async function searchOwners(query: string): Promise<Owner[]> {
  const { data, error } = await supabase
    .from('owners')
    .select('*')
    .ilike('name', `%${query}%`)
    .limit(10)
  if (error) throw error
  return data || []
}