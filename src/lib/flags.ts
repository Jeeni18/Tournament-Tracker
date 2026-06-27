const rawModules = import.meta.glob<{ default: string }>('../assets/Flags/*.png', { eager: true })

// Build map: "Algeria" → "/assets/Algeria-HASH.png"
const FLAG_MAP: Record<string, string> = {}
for (const [path, mod] of Object.entries(rawModules)) {
  const name = path.split('/').pop()!.replace('.png', '')
  FLAG_MAP[name] = mod.default
}

// Only one team name differs from its flag filename: Cote d'Ivoire → Cote d_Ivoire
function normalize(teamName: string): string {
  return teamName.replace(/'/g, '_')
}

export function getFlagUrl(teamName: string): string | undefined {
  return FLAG_MAP[normalize(teamName)]
}
