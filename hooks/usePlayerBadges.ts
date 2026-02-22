import { useBadges } from "./useBadges"
import { useMemo } from "react"
import { Match } from "@/types"

export function usePlayerBadges(ci: string, matches: Match[], profile: any) {
  const { getBadgesForPlayer, loading, error } = useBadges()

  const badges = useMemo(() => {
    if (loading || !ci || !matches) return []
    return getBadgesForPlayer(ci, matches, profile)
  }, [ci, getBadgesForPlayer, loading, matches, profile])

  return { badges, loading, error }
}
