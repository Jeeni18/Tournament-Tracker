import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getBracketSlots, updateBracketSlot } from '../lib/api'

export function useBracketSlots() {
  return useQuery({ queryKey: ['bracket_slots'], queryFn: getBracketSlots })
}

export function useUpdateBracketSlot() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ slotNumber, teamId }: { slotNumber: number; teamId: string | null }) =>
      updateBracketSlot(slotNumber, teamId),
    onSuccess: () => {
      qc.invalidateQueries()
    },
  })
}