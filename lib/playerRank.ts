
async function fetchAllPlayersAuras(): Promise<number[]> {
  try {
    const res = await fetch(`http://localhost:3000/api/players`)
    if (!res.ok) return []
    const body = await res.json()
    const data = body?.data ?? body
    if (!Array.isArray(data)) return []

    return data.map((p: any) => {
      const aura = p?.aura ?? p?.Aura ?? 0
      const n = Number(aura)
      return Number.isFinite(n) ? n : 0
    })
  } catch {
    return []
  }
}

export async function calculatePlayerRank(playerAura: number): Promise<number> {
  const allAuras = await fetchAllPlayersAuras()
  // Rank = 1 + cantidad de jugadores con aura mayor (permite empates)
  const rank = 1 + allAuras.filter((a) => a > playerAura).length
  return rank
}
