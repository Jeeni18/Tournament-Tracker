import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getAllMatches, getGroupMatches, getKnockoutMatches, updateMatchScore, saveKnockoutScore, clearKnockoutScore } from '../lib/api'

// Single shared query for ALL matches — the source of truth for all computed stats
export function useAllMatches() {
  return useQuery({ queryKey: ['matches'], queryFn: getAllMatches })
}

export function useGroupMatches() {
  return useQuery({ queryKey: ['matches', 'group'], queryFn: getGroupMatches })
}

export function useKnockoutMatches() {
  return useQuery({ queryKey: ['matches', 'knockout'], queryFn: getKnockoutMatches })
}

export function useUpdateMatchScore() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      matchId, homeScore, awayScore, extraTime, completed,
    }: {
      matchId: string; homeScore: number; awayScore: number; extraTime: boolean; completed: boolean
    }) => updateMatchScore(matchId, homeScore, awayScore, extraTime, completed),
    onSuccess: () => qc.invalidateQueries(),
  })
}

export function useSaveKnockoutScore() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      matchId, homeTeamId, awayTeamId, homeScore, awayScore, extraTime, penaltyWinner, completed,
    }: {
      matchId: string
      homeTeamId: string | null
      awayTeamId: string | null
      homeScore: number
      awayScore: number
      extraTime: boolean
      penaltyWinner: 'home' | 'away' | null
      completed: boolean
    }) => saveKnockoutScore(matchId, homeTeamId, awayTeamId, homeScore, awayScore, extraTime, penaltyWinner, completed),
    onSuccess: () => qc.invalidateQueries(),
  })
}

export function useClearKnockoutScore() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (matchId: string) => clearKnockoutScore(matchId),
    onSuccess: () => qc.invalidateQueries(),
  })
}