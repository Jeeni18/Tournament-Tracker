import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getTeams, getTeam, updateTeamAdvancement } from '../lib/api'
import type { Team } from '../types'

export function useTeams() {
  return useQuery({ queryKey: ['teams'], queryFn: getTeams })
}

export function useTeam(id: string) {
  return useQuery({ queryKey: ['teams', id], queryFn: () => getTeam(id), enabled: !!id })
}

export function useUpdateTeamAdvancement() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ teamId, flags }: {
      teamId: string
      flags: Partial<Pick<Team, 'round_of_32' | 'round_of_16' | 'quarterfinal' | 'semifinal' | 'final_round' | 'winner'>>
    }) => updateTeamAdvancement(teamId, flags),
    onSuccess: () => qc.invalidateQueries(),
  })
}
