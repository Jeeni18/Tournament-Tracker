import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getAllMatches, getGroupMatches, getKnockoutMatches, updateMatchScore } from '../lib/api'

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
    onSuccess: () => {
      // Invalidate every query — React Query will refetch all of them immediately
      qc.invalidateQueries()
    },
  })
}