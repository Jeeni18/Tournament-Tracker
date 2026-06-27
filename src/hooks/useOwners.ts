import { useQuery } from '@tanstack/react-query'
import { getOwners, getOwnerRankings } from '../lib/api'

export function useOwners() {
  return useQuery({ queryKey: ['owners'], queryFn: getOwners })
}

export function useOwnerRankings() {
  return useQuery({ queryKey: ['owner_rankings'], queryFn: getOwnerRankings })
}
