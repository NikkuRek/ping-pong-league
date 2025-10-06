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

const PlayerRecentMatches: React.FC<PlayerRecentMatchesProps> = ({ playerId }) => {
  const { matches: recentMatches, loading, error } = usePlayerMatches(playerId, "Finalizado")
  const [playerBackendResponseMap, setPlayerBackendResponseMap] = useState<Map<string, PlayerBackendResponse>>(
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

        const response = await fetch(`${apiUrl}/career`)

        if (response.ok) {
          const data = await response.json()
          const newCareerMap = new Map<number, string>()
          if (data && data.data) {
            data.data.forEach((career: Career) => {
              newCareerMap.set(career.career_id, career.name_career)
            })
          }
          setCareerMap(newCareerMap)
        } else {
          console.error("Failed to fetch career data, status:", response.status)
        }
      } catch (err) {
        console.error("Error fetching career data:", err)
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
        if (match.player1Ci) uniquePlayerCis.add(match.player1Ci)
        if (match.player2Ci) uniquePlayerCis.add(match.player2Ci)
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
            console.error(`Failed to fetch player details for CI: ${ci}`)
          }
        } catch (err) {
          console.error(`Error fetching player details for CI: ${ci}`, err)
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
            const player1Details = playerBackendResponseMap.get(match.player1Ci)
            const player2Details = playerBackendResponseMap.get(match.player2Ci)

            const player1CareerName = player1Details ? careerMap.get(player1Details.career_id) : "Cargando..."
            const player2CareerName = player2Details ? careerMap.get(player2Details.career_id) : "Cargando..."

            const p1FirstName = player1Details?.first_name?.trim().split(/\s+/)[0] ?? "";
            const p1LastName = player1Details?.last_name?.trim().split(/\s+/)[0] ?? "";
            const player1ShortName = `${p1FirstName} ${p1LastName}`.trim();

            const p2FirstName = player2Details?.first_name?.trim().split(/\s+/)[0] ?? "";
            const p2LastName = player2Details?.last_name?.trim().split(/\s+/)[0] ?? "";
            const player2ShortName = `${p2FirstName} ${p2LastName}`.trim();

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