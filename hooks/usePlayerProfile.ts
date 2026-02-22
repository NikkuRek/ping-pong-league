"use client"

import { useEffect, useMemo, useState } from "react"
import { usePlayerMatches } from "./usePlayerMatches"
import type { PlayerProfile as PlayerProfileType, Career } from "@/types"
import { getApiUrl } from "@/lib/api-config"

/**
 * Hook that encapsulates all profile loading logic, careers, and win/loss calculations.
 */
export function usePlayerProfile(ci: string) {
  const [profile, setProfile] = useState<PlayerProfileType | null>(null)
  const [careerMap, setCareerMap] = useState<Map<number, string>>(new Map())
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [rank, setRank] = useState<number>(0)
  const [totalPlayers, setTotalPlayers] = useState<number>(0)

  const { matches, rawMatches, loading: matchesLoading, error: matchesError } = usePlayerMatches(ci)

  const apiBase = useMemo(() => getApiUrl(), [])

  useEffect(() => {
    if (!ci) {
      setError("CI de jugador no provisto.")
      setLoading(false)
      return
    }
    if (!apiBase) {
      setError("URL de API no configurada.")
      setLoading(false)
      return
    }

    const controller = new AbortController()
    const signal = controller.signal

    async function fetchProfileAndCareers() {
      setLoading(true)
      setError(null)

      try {
        const profileResPromise = fetch(`${apiBase}/player/${ci}`, { signal }).catch((e) => {
          if (e.name === "AbortError") throw e
          return null
        })

        const careersResPromise = fetch(`${apiBase}/career`, { signal }).catch((e) => {
          if (e.name === "AbortError") throw e
          return null
        })

        const allPlayersResPromise = fetch(`${apiBase}/player/active`, { signal }).catch((e) => {
          if (e.name === "AbortError") throw e
          return null
        })

        const [profileRes, careersRes, allPlayersRes] = await Promise.all([
          profileResPromise,
          careersResPromise,
          allPlayersResPromise,
        ])

        if (!profileRes) {
          setError("No se pudo obtener el perfil del jugador.")
          setProfile(null)
        } else if (!profileRes.ok) {
          setError("No se pudo cargar el perfil del jugador.")
          setProfile(null)
        } else {
          const json = await profileRes.json()
          const data = json?.data ?? json
          setProfile(data as PlayerProfileType)
        }

        if (careersRes && careersRes.ok) {
          const json = await careersRes.json()
          const careersData: Career[] = json?.data ?? json ?? []
          const map = new Map<number, string>()
          careersData.forEach((c) => {
            if (c?.career_id != null && c?.name_career) {
              map.set(c.career_id, c.name_career)
            }
          })
          setCareerMap(map)
        }

        if (allPlayersRes && allPlayersRes.ok) {
          const json = await allPlayersRes.json()
          const allPlayers = Array.isArray(json) ? json : (json?.data ?? [])
          const sortedPlayers = allPlayers.sort((a: any, b: any) => (b.aura ?? 0) - (a.aura ?? 0))
          const playerRank = sortedPlayers.findIndex((p: any) => p.ci === ci)
          setRank(playerRank >= 0 ? playerRank + 1 : 0)
          setTotalPlayers(allPlayers.length)
        }
      } catch (err: any) {
        if (err.name === "AbortError") return
        console.error(err)
        setError("Ocurrió un error al cargar los datos.")
      } finally {
        setLoading(false)
      }
    }

    fetchProfileAndCareers()

    return () => {
      controller.abort()
    }
  }, [ci, apiBase])

  const wins = useMemo(() => {
    if (!matches) return 0
    return matches.reduce((acc, m) => (m.result === "win" ? acc + 1 : acc), 0)
  }, [matches])

  const losses = useMemo(() => {
    if (!matches) return 0
    return matches.reduce((acc, m) => (m.result === "loss" ? acc + 1 : acc), 0)
  }, [matches])

  return {
    profile,
    careerMap,
    wins,
    losses,
    rank,
    totalPlayers,
    matches,
    rawMatches,
    loading: loading || matchesLoading,
    error: error ?? matchesError?.message,
  }
}
