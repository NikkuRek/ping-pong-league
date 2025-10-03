import { getApiUrl } from "@/lib/api-config"

interface PlayerAuraInfo {
  ci: string
  aura: number
}

async function fetchAllPlayersAuraInfo(): Promise<PlayerAuraInfo[]> {
  console.log("Fetching all players aura info...")
  try {
    const apiUrl = getApiUrl()
    const res = await fetch(`${apiUrl}/players`)

    console.log("API response status ok:", res.ok)
    console.log("API response status:", res.status)
    console.log("API response status text:", res.statusText)

    if (!res.ok) {
      console.error("API call failed with status:", res.status, res.statusText)
      return []
    }

    const body = await res.json()
    let data = body?.data ?? body
    console.log("Raw API data received:", data)

    // Ensure data is an array of player objects
    if (!Array.isArray(data)) {
      if (data && typeof data === "object" && data.ci) {
        // data is a single player object
        data = [data]
      } else if (data && typeof data === "object" && data.data && typeof data.data === "object" && data.data.ci) {
        // data.data is a single player object
        data = [data.data]
      } else {
        console.error("API data is not an array or a single player object:", data)
        return []
      }
    }

    const playersAuraInfo = data.map((p: any) => {
      const aura = p?.aura ?? p?.Aura ?? 0
      const n = Number(aura)
      return {
        ci: p.ci,
        aura: Number.isFinite(n) ? n : 0,
      }
    })
    console.log("Processed players aura info:", playersAuraInfo)
    return playersAuraInfo
  } catch (error) {
    console.error("Error fetching all players aura info:", error)
    return []
  }
}

async function calculatePlayerRank(playerIdOrAura: string | number): Promise<number> {
  console.log("Calculating rank for player identifier or aura:", playerIdOrAura)
  const allPlayersAuraInfo = await fetchAllPlayersAuraInfo()
  let currentPlayerAura: number | undefined

  if (typeof playerIdOrAura === "number") {
    currentPlayerAura = playerIdOrAura
  } else {
    currentPlayerAura = allPlayersAuraInfo.find((p) => p.ci === playerIdOrAura)?.aura
  }

  console.log("All players aura info:", allPlayersAuraInfo)
  console.log("Current player aura:", currentPlayerAura)

  if (currentPlayerAura === undefined) {
    console.log("Player not found or aura not available for identifier:", playerIdOrAura)
    return 0 // Player not found or aura not available
  }

  const allAuras = allPlayersAuraInfo.map((p) => p.aura)
  console.log("All auras for comparison:", allAuras)
  // Rank = 1 + cantidad de jugadores con aura mayor (permite empates)
  const rank = 1 + allAuras.filter((a) => a > currentPlayerAura).length
  console.log("Calculated rank:", rank)
  return rank
}
