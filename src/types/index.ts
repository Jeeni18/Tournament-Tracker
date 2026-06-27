// export interface Owner {
//   id: string
//   name: string
//   created_at: string
// }

// export interface Team {
//   id: string
//   team_name: string
//   pot_number: number
//   owner_id: string
//   goals_scored: number
//   goals_conceded: number
//   goal_difference: number
//   total_points: number
//   created_at: string
//   owner?: Owner
// }

// export interface Match {
//   id: string
//   stage: 'group' | 'round_of_32' | 'round_of_16' | 'quarterfinal' | 'semifinal' | 'final'
//   group_name: string | null
//   match_date: string
//   match_time: string
//   venue: string
//   home_team_id: string
//   away_team_id: string
//   home_score: number | null
//   away_score: number | null
//   extra_time_or_penalties: boolean
//   completed: boolean
//   slot_number: number | null
//   created_at: string
//   home_team?: Team
//   away_team?: Team
// }

// export interface OwnerRanking {
//   id: string
//   owner_id: string
//   total_points: number
//   goal_difference: number
//   updated_at: string
//   owner?: Owner
// }

// export interface BracketSlot {
//   id: string
//   round_name: string
//   slot_number: number
//   team_id: string | null
//   created_at: string
//   team?: Team
// }

// export interface TeamStanding {
//   team: Team
//   played: number
//   points: number
//   goals_scored: number
//   goals_conceded: number
//   goal_difference: number
//   rank: number
// }

// export interface OwnerStanding {
//   owner: Owner
//   total_points: number
//   goal_difference: number
//   teams: Team[]
//   rank: number
// }

// export type UserRole = 'admin' | 'viewer' | null

export interface Owner {
  id: string
  name: string
  created_at: string
}

export interface Team {
  id: string
  team_name: string
  pot_number: number
  owner_id: string
  goals_scored: number
  goals_conceded: number
  goal_difference: number
  total_points: number
  created_at: string
  owner?: Owner
  // Round advancement attributes (admin-ticked, each gives +1 round point)
  round_of_32: boolean
  round_of_16: boolean
  quarterfinal: boolean
  semifinal: boolean
  final_round: boolean
  winner: boolean
}

export interface Match {
  id: string
  stage: 'group' | 'round_of_32' | 'round_of_16' | 'quarterfinal' | 'semifinal' | 'final'
  group_name: string | null
  match_date: string
  match_time: string
  venue: string
  home_team_id: string
  away_team_id: string
  home_score: number | null
  away_score: number | null
  extra_time_or_penalties: boolean
  completed: boolean
  slot_number: number | null
  created_at: string
  home_team?: Team
  away_team?: Team
}

export interface OwnerRanking {
  id: string
  owner_id: string
  total_points: number
  goal_difference: number
  games_played: number
  updated_at: string
  owner?: Owner
}

export interface BracketSlot {
  id: string
  round_name: string
  slot_number: number
  team_id: string | null
  created_at: string
  team?: Team
}

export interface TeamStanding {
  team: Team
  played: number
  points: number
  goals_scored: number
  goals_conceded: number
  goal_difference: number
  rank: number
}

export interface OwnerStanding {
  owner: Owner
  total_points: number
  goal_difference: number
  teams: Team[]
  rank: number
}

export type UserRole = 'admin' | 'viewer' | null