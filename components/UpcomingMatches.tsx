"use client"

import type React from "react"
import { useEffect, useState, useRef } from "react"
import Image from "next/image"
import { Skeleton } from "./ui/skeleton"
import type { PlayerBackendResponse as PlayerDetails } from "@/types"
import { getApiUrl } from "@/lib/api-config"
import { usePlayerMatches } from "@/hooks/usePlayerMatches"

type Career = { career_id: number; name_career: string }

const getShortName = (fullName: string): string => {
  if (!fullName) return "—"
  
  const names = fullName.trim().split(/\s+/)
  if (names.length === 0) return "—"
  
  const firstName = names[0]
  
  let firstLastName = ""
  for (let i = 1; i < names.length; i++) {
    if (names[i] && names[i].length > 0) {
      firstLastName = names[i]
      break
    }
  }
  
  return firstLastName ? `${firstName} ${firstLastName}` : firstName
}

const UpcomingMatches: React.FC<{ ci: string }> = ({ ci: playerId }) => {
  const { matches, loading, error } = usePlayerMatches(playerId, "not-Finalizado")

  const [playerDetailsMap, setPlayerDetailsMap] = useState<Map<string, PlayerDetails>>(new Map())
  const [careerMap, setCareerMap] = useState<Map<number, string>>(new Map())
  const [loadingPlayerDetails, setLoadingPlayerDetails] = useState(true)
  const [loadingCareers, setLoadingCareers] = useState(true)
  const fetchedCisRef = useRef<Set<string>>(new Set())

  // Fetch Careers
  useEffect(() => {
    const fetchCareers = async () => {
      try {
        setLoadingCareers(true)
        const apiUrl = getApiUrl()

        console.log("[v0] UpcomingMatches: Fetching careers from:", `${apiUrl}/player`)
        const response = await fetch(`${apiUrl}/player`)
        console.log("[v0] UpcomingMatches: Response status:", response.status, response.ok)

        if (response.ok) {
          const data = await response.json()
          console.log("[v0] UpcomingMatches: Raw API response:", data)
          console.log("[v0] UpcomingMatches: data.data type:", typeof data.data, Array.isArray(data.data))
          console.log("[v0] UpcomingMatches: First item in data.data:", data.data?.[0])

          const newCareerMap = new Map<number, string>()
          data.data.forEach((career: Career) => {
            console.log("[v0] UpcomingMatches: Processing career item:", career)
            console.log("[v0] UpcomingMatches: career_id:", career.career_id, "name_career:", career.name_career)
            newCareerMap.set(career.career_id, career.name_career)
          })
          console.log("[v0] UpcomingMatches: Final careerMap size:", newCareerMap.size)
          console.log("[v0] UpcomingMatches: Final careerMap entries:", Array.from(newCareerMap.entries()))
          setCareerMap(newCareerMap)
        } else {
          console.error("[v0] UpcomingMatches: Failed to fetch career data, status:", response.status)
        }
      } catch (err) {
        console.error("[v0] UpcomingMatches: Error fetching career data:", err)
      } finally {
        setLoadingCareers(false)
      }
    }
    fetchCareers()
  }, [])

  // Fetch Player Details
  useEffect(() => {
    const fetchDetails = async () => {
      if (matches.length === 0) {
        setLoadingPlayerDetails(false)
        return
      }

      setLoadingPlayerDetails(true)
      const uniqueCis = new Set<string>()
      matches.forEach((m) => {
        uniqueCis.add(m.player1Ci)
        uniqueCis.add(m.player2Ci)
      })

      playerDetailsMap.forEach((_, key) => {
        fetchedCisRef.current.add(key)
      })

      const newPlayerDetailsMap = new Map<string, PlayerDetails>()
      const apiUrl = getApiUrl()

      for (const playerCi of Array.from(uniqueCis)) {
        if (!playerCi || fetchedCisRef.current.has(playerCi)) {
          continue
        }
        try {
          const res = await fetch(`${apiUrl}/player/${playerCi}`)
          if (res.ok) {
            const json = await res.json()
            const pd = json.data ?? json.player ?? null
            if (pd) {
              newPlayerDetailsMap.set(playerCi, pd as PlayerDetails)
              fetchedCisRef.current.add(playerCi)
            }
          } else {
            console.error(`[v0] Failed to fetch player details for CI: ${playerCi}`)
          }
        } catch (err) {
          console.error("[v0] Error fetching player", playerCi, err)
        }
      }

      if (newPlayerDetailsMap.size > 0) {
        setPlayerDetailsMap((prev) => new Map([...prev, ...newPlayerDetailsMap]))
      }
      setLoadingPlayerDetails(false)
    }

    fetchDetails()
  }, [matches])

  if (loading || loadingPlayerDetails || loadingCareers) {
    return (
      <section className="bg-[#2A2A3E] p-5 mt-5 mb-5 rounded-2xl border border-slate-700/50 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-white">Próximos Partidos</h4>
        </div>
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-slate-800/50 p-3 rounded-lg flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-[100px]" />
                  <Skeleton className="h-3 w-[80px]" />
                </div>
              </div>
              <div className="text-center space-y-2">
                <Skeleton className="h-4 w-[40px] mx-auto" />
                <Skeleton className="h-3 w-[50px] mx-auto" />
              </div>
              <div className="flex items-center gap-3">
                <div className="space-y-1 text-right">
                  <Skeleton className="h-4 w-[100px]" />
                  <Skeleton className="h-3 w-[80px]" />
                </div>
                <Skeleton className="h-12 w-12 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="bg-[#2A2A3E] p-5 mt-5 mb-5 rounded-2xl border border-slate-700/50 space-y-4">
        <h4 className="text-sm font-semibold text-white">Próximos Partidos</h4>
        <p className="text-sm text-red-500">Error al cargar los partidos.</p>
      </section>
    )
  }

  return (
    <section className="bg-[#2A2A3E] p-5 mt-5 mb-5 rounded-2xl border border-slate-700/50 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-white">Próximos Partidos</h4>
        <span className="text-xs text-slate-400">{matches.length} partidos</span>
      </div>

      {matches.length > 0 ? (
        <div className="space-y-4">
          {matches.map((match) => {
            const p1Ci = match.player1Ci
            const p2Ci = match.player2Ci
            const player1Details = p1Ci ? playerDetailsMap.get(p1Ci) : undefined
            const player2Details = p2Ci ? playerDetailsMap.get(p2Ci) : undefined

            const getCareerName = (details: PlayerDetails | undefined) => {
              if (loadingCareers) return "Cargando..."
              if (!details) return "—"
              const careerId = Number(details.career_id)
              console.log("[v0] UpcomingMatches: Looking up career for player:", details.ci, "career_id:", careerId)
              console.log("[v0] UpcomingMatches: careerMap has career_id?", careerMap.has(careerId))
              console.log("[v0] UpcomingMatches: careerMap value:", careerMap.get(careerId))
              return careerMap.get(careerId) ?? "—"
            }

            const player1CareerName = getCareerName(player1Details)
            const player2CareerName = getCareerName(player2Details)

            const isPlayer1Loading = loadingPlayerDetails && !player1Details
            const isPlayer2Loading = loadingPlayerDetails && !player2Details

            // Obtener nombres cortos
            const player1ShortName = getShortName(match.player1Name)
            const player2ShortName = getShortName(match.player2Name)

            return (
              <div
                key={match.id}
                className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 flex flex-col sm:flex-row items-center justify-between"
              >
                <div className="flex items-center gap-3 w-full sm:w-1/3">
                  <Image
                    src={match.player1Avatar || "/placeholder-user.jpg"}
                    alt={match.player1Name}
                    width={48}
                    height={48}
                    className="w-12 h-12 rounded-full object-cover"
                    unoptimized
                  />
                  <div>
                    <p className="font-bold text-white text-sm">{player1ShortName}</p>
                    {isPlayer1Loading ? (
                      <div className="space-y-1 mt-1">
                        <Skeleton className="h-3 w-[60px]" />
                        <Skeleton className="h-3 w-[80px]" />
                      </div>
                    ) : (
                      player1Details && (
                        <>
                          <p className="text-xs text-slate-400">Aura: {player1Details.aura ?? "—"}</p>
                          <p className="text-xs text-slate-400">Carrera: {player1CareerName}</p>
                        </>
                      )
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center w-full sm:w-1/3 my-4 sm:my-0">
                  <p className="text-xl font-bold">
                    <span className="text-slate-400">{match.score1}</span>
                    <span className="text-slate-500 mx-2 text-base">VS</span>
                    <span className="text-slate-400">{match.score2}</span>
                  </p>
                  <p className="text-sm text-slate-400 mt-1">{match.tournamentName}</p>
                  <p className="text-xs text-slate-500">{match.timeAgo}</p>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-1/3 justify-end">
                  <div className="text-right">
                    <p className="font-bold text-white text-sm">{player2ShortName}</p>
                    {isPlayer2Loading ? (
                      <div className="space-y-1 mt-1">
                        <Skeleton className="h-3 w-[60px] ml-auto" />
                        <Skeleton className="h-3 w-[80px] ml-auto" />
                      </div>
                    ) : (
                      player2Details && (
                        <>
                          <p className="text-xs text-slate-400">Aura: {player2Details.aura ?? "—"}</p>
                          <p className="text-xs text-slate-400">Carrera: {player2CareerName}</p>
                        </>
                      )
                    )}
                  </div>
                  <Image
                    src={match.player2Avatar || "/placeholder-user.jpg"}
                    alt={match.player2Name}
                    width={48}
                    height={48}
                    className="w-12 h-12 rounded-full object-cover"
                    unoptimized
                  />
                </div>

                {match.sets && match.sets.length > 0 && (
                  <div className="w-full pt-4 border-t border-slate-700/50 flex justify-center gap-2 mt-4">
                    {match.sets.map((set, index) => (
                      <div
                        key={index}
                        className={`px-3 py-1 rounded text-sm font-semibold 
                                ${set.p1 > set.p2 ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}
                                `}
                      >
                        {set.p1}-{set.p2}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <p className="text-sm text-slate-400">No se encontraron partidos próximos para este usuario.</p>
      )}
    </section>
  )
}

export default UpcomingMatches