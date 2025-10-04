"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { usePlayerMatches } from "@/hooks/usePlayerMatches"
import { Skeleton } from "./ui/skeleton"
import type { PlayerBackendResponse, Career } from "@/types"
import { getApiUrl } from "@/lib/api-config"

interface PlayerRecentMatchesProps {
  playerId: string
}

// Función para obtener solo el primer nombre y primer apellido
const getShortName = (fullName: string): string => {
  if (!fullName) return "—"
  
  const names = fullName.trim().split(/\s+/)
  if (names.length === 0) return "—"
  
  // Primer nombre
  const firstName = names[0]
  
  // Buscar el primer apellido (primer elemento después del último nombre)
  let firstLastName = ""
  for (let i = 1; i < names.length; i++) {
    if (names[i] && names[i].length > 0) {
      firstLastName = names[i]
      break
    }
  }
  
  return firstLastName ? `${firstName} ${firstLastName}` : firstName
}

const PlayerRecentMatches: React.FC<PlayerRecentMatchesProps> = ({ playerId }) => {
  const { matches: recentMatches, loading, error } = usePlayerMatches(playerId, "Finalizado")
  const [PlayerBackendResponseMap, setPlayerBackendResponseMap] = useState<Map<string, PlayerBackendResponse>>(
    new Map(),
  )
  const [careerMap, setCareerMap] = useState<Map<number, string>>(new Map())
  const [loadingPlayerBackendResponse, setLoadingPlayerBackendResponse] = useState(true)
  const [loadingCareers, setLoadingCareers] = useState(true)
  const fetchedCisRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    const fetchCareers = async () => {
      try {
        setLoadingCareers(true)
        const apiUrl = getApiUrl()

        console.log("[v0] PlayerRecentMatches: Fetching careers from:", `${apiUrl}/player`)
        const response = await fetch(`${apiUrl}/player`)
        console.log("[v0] PlayerRecentMatches: Response status:", response.status, response.ok)

        if (response.ok) {
          const data = await response.json()
          console.log("[v0] PlayerRecentMatches: Raw API response:", data)
          console.log("[v0] PlayerRecentMatches: data.data type:", typeof data.data, Array.isArray(data.data))
          console.log("[v0] PlayerRecentMatches: First item in data.data:", data.data?.[0])

          const newCareerMap = new Map<number, string>()
          data.data.forEach((career: Career) => {
            console.log("[v0] PlayerRecentMatches: Processing career item:", career)
            console.log("[v0] PlayerRecentMatches: career_id:", career.career_id, "name_career:", career.name_career)
            newCareerMap.set(career.career_id, career.name_career)
          })
          console.log("[v0] PlayerRecentMatches: Final careerMap size:", newCareerMap.size)
          console.log("[v0] PlayerRecentMatches: Final careerMap entries:", Array.from(newCareerMap.entries()))
          setCareerMap(newCareerMap)
        } else {
          console.error("[v0] PlayerRecentMatches: Failed to fetch career data, status:", response.status)
        }
      } catch (err) {
        console.error("[v0] PlayerRecentMatches: Error fetching career data:", err)
      } finally {
        setLoadingCareers(false)
      }
    }
    fetchCareers()
  }, [])

  useEffect(() => {
    const fetchDetails = async () => {
      if (!recentMatches || recentMatches.length === 0) {
        setLoadingPlayerBackendResponse(false)
        return
      }

      setLoadingPlayerBackendResponse(true)
      const uniquePlayerCis = new Set<string>()
      recentMatches.forEach((match) => {
        uniquePlayerCis.add(match.player1Ci)
        uniquePlayerCis.add(match.player2Ci)
      })

      PlayerBackendResponseMap.forEach((_, key) => {
        fetchedCisRef.current.add(key)
      })

      const newPlayerBackendResponseMap = new Map<string, PlayerBackendResponse>()

      const apiUrl = getApiUrl()

      for (const ci of Array.from(uniquePlayerCis)) {
        if (fetchedCisRef.current.has(ci)) {
          continue
        }
        try {
          const response = await fetch(`${apiUrl}/player/${ci}`)
          if (response.ok) {
            const data = await response.json()
            newPlayerBackendResponseMap.set(ci, data.data)
            fetchedCisRef.current.add(ci)
          } else {
            console.error(`[v0] Failed to fetch player details for CI: ${ci}`)
          }
        } catch (err) {
          console.error(`[v0] Error fetching player details for CI: ${ci}`, err)
        }
      }

      if (newPlayerBackendResponseMap.size > 0) {
        setPlayerBackendResponseMap((prevMap) => new Map([...prevMap, ...newPlayerBackendResponseMap]))
      }
      setLoadingPlayerBackendResponse(false)
    }

    fetchDetails()
  }, [recentMatches])

  if (loading || loadingPlayerBackendResponse || loadingCareers) {
    return (
      <section className="bg-[#2A2A3E] p-5 mt-5 mb-15 rounded-2xl border border-slate-700/50 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-white">Últimos Partidos</h4>
        </div>
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-slate-800/50 p-3 rounded-lg flex items-center justify-between gap-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-3 w-[80px]" />
              </div>
              <div className="text-center space-y-2">
                <Skeleton className="h-4 w-[40px] mx-auto" />
                <Skeleton className="h-3 w-[50px] mx-auto" />
              </div>
              <div>
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="bg-[#2A2A3E] p-5 mt-5 mb-15 rounded-2xl border border-slate-700/50 space-y-4">
        <h4 className="text-sm font-semibold text-white">Últimos Partidos</h4>
        <p className="text-sm text-red-500">Error al cargar los partidos.</p>
      </section>
    )
  }

  return (
    <section className="bg-[#2A2A3E] p-5 mt-5 mb-15 rounded-2xl border border-slate-700/50 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-white">Últimos Partidos</h4>
        <span className="text-xs text-slate-400">{recentMatches.length} partidos</span>
      </div>

      {recentMatches.length > 0 ? (
        <div className="space-y-4">
          {recentMatches.map((match) => {
            const player1Details = PlayerBackendResponseMap.get(match.player1Ci)
            const player2Details = PlayerBackendResponseMap.get(match.player2Ci)

            const player1CareerName = player1Details ? careerMap.get(player1Details.career_id) : "Cargando..."
            const player2CareerName = player2Details ? careerMap.get(player2Details.career_id) : "Cargando..."

            // Obtener nombres cortos
            const player1ShortName = getShortName(match.player1Name)
            const player2ShortName = getShortName(match.player2Name)

            if (player1Details) {
              console.log(
                "[v0] PlayerRecentMatches: Player1 career_id:",
                player1Details.career_id,
                "career name:",
                player1CareerName,
              )
              console.log(
                "[v0] PlayerRecentMatches: careerMap has player1 career_id?",
                careerMap.has(player1Details.career_id),
              )
            }
            if (player2Details) {
              console.log(
                "[v0] PlayerRecentMatches: Player2 career_id:",
                player2Details.career_id,
                "career name:",
                player2CareerName,
              )
              console.log(
                "[v0] PlayerRecentMatches: careerMap has player2 career_id?",
                careerMap.has(player2Details.career_id),
              )
            }

            return (
              <div key={match.id} className="bg-[#2A2A3E] p-4 rounded-2xl border border-slate-700/50 space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <Image
                      src={match.player1Avatar || "/placeholder-user.jpg"}
                      alt={match.player1Name}
                      width={48}
                      height={48}
                      className="rounded-full"
                      unoptimized
                    />
                    <div>
                      <p className="font-bold text-white">{player1ShortName}</p>
                      {player1Details && (
                        <>
                          <p className="text-xs text-slate-400">Aura: {player1Details.aura}</p>
                          <p className="text-xs text-slate-400">Carrera: {player1CareerName}</p>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="text-center">
                    <p className="text-2xl font-bold">
                      <span className={match.score1 > match.score2 ? "text-white" : "text-slate-400"}>
                        {match.score1}
                      </span>
                      <span className="text-slate-500 mx-2">VS</span>
                      <span className={match.score2 > match.score1 ? "text-white" : "text-slate-400"}>
                        {match.score2}
                      </span>
                    </p>
                  </div>

                  <div className="flex items-center gap-3 text-right">
                    <div className="text-right">
                      <p className="font-bold text-white">{player2ShortName}</p>
                      {player2Details && (
                        <>
                          <p className="text-xs text-slate-400">Aura: {player2Details.aura}</p>
                          <p className="text-xs text-slate-400">Carrera: {player2CareerName}</p>
                        </>
                      )}
                    </div>
                    <Image
                      src={match.player2Avatar || "/placeholder-user.jpg"}
                      alt={match.player2Name}
                      width={48}
                      height={48}
                      className="rounded-full"
                      unoptimized
                    />
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-sm text-slate-400">{match.tournamentName}</p>
                  <p className="text-xs text-slate-500">{match.timeAgo}</p>
                </div>
                <div className="flex justify-center gap-2">
                  {match.sets.map((set, index) => (
                    <div
                      key={index}
                      className={`px-3 py-1 rounded text-sm font-semibold ${set.p1 > set.p2 ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}
                    >
                      {set.p1}-{set.p2}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <p className="text-sm text-slate-400">No se encontraron partidos recientes para este jugador.</p>
      )}
    </section>
  )
}

export default PlayerRecentMatches