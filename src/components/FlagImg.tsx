import { getFlagUrl } from '../lib/flags'

interface Props {
  teamName: string
  size?: number
  className?: string
}

export default function FlagImg({ teamName, size = 20, className = '' }: Props) {
  const url = getFlagUrl(teamName)
  if (!url) return null
  return (
    <img
      src={url}
      alt={teamName}
      className={`rounded-[2px] flex-shrink-0 object-cover shadow-sm ${className}`}
      style={{ width: size, height: Math.round(size * 0.67) }}
    />
  )
}
