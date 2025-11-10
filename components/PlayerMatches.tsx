"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { usePlayerMatches } from "@/hooks/usePlayerMatches"
import { Skeleton } from "./ui/skeleton"
import type { PlayerBackendResponse, Career, MatchData } from "@/types"
import { getApiUrl } from "@/lib/api-config"

interface PlayerMatchesProps {
  playerId: string
}

const getShortName = (fullName: string): string => {
  if (!fullName) return "—"
  
  const names = fullName.trim().split(/\s+/).filter(n => n.length > 0)
  if (names.length === 0) return "—"
  if (names.length === 1) return names[0]
  
  // Assume format: "FirstName(s) LastName(s)"
  // Take first name and first element from second half (likely first last name)
  const firstName = names[0]
  const midPoint = Math.ceil(names.length / 2)
  const firstLastName = names[midPoint] || names[1]
  
  return `${firstName} ${firstLastName}`
}

const formatMatchDate = (dateString: string): string => {
  const date = new Date(dateString)
  const day = date.getDate().toString().padStart(2, '0')
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const year = date.getFullYear()
  return `${day}/${month}/${year}`
}

const PlayerMatches: React.FC<PlayerMatchesProps> = ({ playerId }) => {
  const { matches: upcomingMatches, loading: upcomingLoading, error: upcomingError } = usePlayerMatches(playerId, "not-Finalizado")
  const { matches: recentMatches, loading: recentLoading, error: recentError } = usePlayerMatches(playerId, "Finalizado")

  const [playerDetailsMap, setPlayerDetailsMap] = useState<Map<string, PlayerBackendResponse>>(new Map())
  const [careerMap, setCareerMap] = useState<Map<number, string>>(new Map())
  const [loadingPlayerDetails, setLoadingPlayerDetails] = useState(true)
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
      const allMatches = [...upcomingMatches, ...recentMatches]
      if (allMatches.length === 0) {
        setLoadingPlayerDetails(false)
        return
      }

      setLoadingPlayerDetails(true)
      const uniqueCis = new Set<string>()
      allMatches.forEach((m) => {
        if (m.player1Ci) uniqueCis.add(m.player1Ci)
        if (m.player2Ci) uniqueCis.add(m.player2Ci)
      })

      const newPlayerDetailsMap = new Map<string, PlayerBackendResponse>()
      const apiUrl = getApiUrl()

      for (const playerCi of Array.from(uniqueCis)) {
        if (!playerCi || fetchedCisRef.current.has(playerCi)) {
          continue
        }
        try {
          const res = await fetch(`${apiUrl}/player/${playerCi}`)
          // Debug: log response status for each player CI
          console.log(`[PlayerMatches] fetching player ${playerCi} -> status:`, res.status)
          if (res.ok) {
            const json = await res.json()
            // Debug: log the returned payload to inspect shape
            console.log(`[PlayerMatches] player ${playerCi} payload:`, json)
            const pd = json.data ?? json.player ?? null
            if (pd) {
              newPlayerDetailsMap.set(playerCi, pd as PlayerBackendResponse)
              fetchedCisRef.current.add(playerCi)
            } else {
              console.warn(`[PlayerMatches] player ${playerCi} no data found in payload`)
            }
          } else {
            console.error(`Failed to fetch player details for CI: ${playerCi} (status ${res.status})`)
          }
        } catch (err) {
          console.error("Error fetching player", playerCi, err)
        }
      }

      if (newPlayerDetailsMap.size > 0) {
        setPlayerDetailsMap((prev) => new Map([...prev, ...newPlayerDetailsMap]))
      }
      setLoadingPlayerDetails(false)
    }

    if (!upcomingLoading && !recentLoading) {
        fetchDetails()
    }
  }, [upcomingMatches, recentMatches, upcomingLoading, recentLoading])

  const renderUpcomingMatch = (match: MatchData) => {
    const p1Ci = match.player1Ci
    const p2Ci = match.player2Ci
    const player1Details = p1Ci ? playerDetailsMap.get(p1Ci) : undefined
    const player2Details = p2Ci ? playerDetailsMap.get(p2Ci) : undefined

    const getCareerName = (details: PlayerBackendResponse | undefined) => {
      if (loadingCareers) return "Cargando..."
      if (!details) return "—"
      const careerId = Number(details.career_id)
      return careerMap.get(careerId) ?? "—"
    }

    const player1CareerName = getCareerName(player1Details)
    const player2CareerName = getCareerName(player2Details)

    const isPlayer1Loading = loadingPlayerDetails && !player1Details
    const isPlayer2Loading = loadingPlayerDetails && !player2Details

    const player1ShortName = getShortName(match.player1Name)
    const player2ShortName = getShortName(match.player2Name)

    const player1Days = player1Details?.Days?.map((d) => d.day_name) ?? []
    const player2Days = player2Details?.Days?.map((d) => d.day_name) ?? []
    const commonDays = player1Days.filter((day) => player2Days.includes(day))

    return (
      <div key={match.id} className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 relative">
        {/* Match ID */}
        <span className="absolute top-2 right-2 text-[10px] text-slate-800">#{match.id}</span>
        {/* Grid layout for match info */}
        <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center mb-4">
          {/* Player 1 */}
          <Link href={`/players/${p1Ci}`} className="grid grid-cols-[48px_1fr] gap-3 items-center hover:opacity-80 transition-opacity">
            <Image 
              src={match.player1Avatar || "/placeholder-user.jpg"} 
              alt={match.player1Name} 
              width={48} 
              height={48} 
              className="w-12 h-12 rounded-full object-cover" 
              unoptimized 
            />
            <div className="min-w-0">
              <p className="font-bold text-white text-sm truncate hover:text-purple-400 transition-colors">{player1ShortName}</p>
              {isPlayer1Loading ? (
                <div className="space-y-1 mt-1">
                  <Skeleton className="h-3 w-[60px]" />
                  <Skeleton className="h-3 w-[80px]" />
                </div>
              ) : (
                player1Details && (
                  <>
                    <p className="text-xs text-slate-400">Aura: {player1Details.aura ?? "—"}</p>
                    <p className="text-xs text-slate-400 truncate">Carrera: {player1CareerName}</p>
                  </>
                )
              )}
            </div>
          </Link>

          {/* Score */}
          <div className="text-center px-4">
            <p className="text-xl font-bold whitespace-nowrap">
              <span className="text-slate-400">{match.score1}</span>
              <span className="text-slate-500 mx-2">VS</span>
              <span className="text-slate-400">{match.score2}</span>
            </p>
          </div>

          {/* Player 2 */}
          <Link href={`/players/${p2Ci}`} className="grid grid-cols-[1fr_48px] gap-3 items-center hover:opacity-80 transition-opacity">
            <div className="text-right min-w-0">
              <p className="font-bold text-white text-sm truncate hover:text-purple-400 transition-colors">{player2ShortName}</p>
              {isPlayer2Loading ? (
                <div className="space-y-1 mt-1">
                  <Skeleton className="h-3 w-[60px] ml-auto" />
                  <Skeleton className="h-3 w-[80px] ml-auto" />
                </div>
              ) : (
                player2Details && (
                  <>
                    <p className="text-xs text-slate-400">Aura: {player2Details.aura ?? "—"}</p>
                    <p className="text-xs text-slate-400 truncate">Carrera: {player2CareerName}</p>
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
          </Link>
        </div>

        {/* Tournament info */}
        <div className="text-center border-t border-slate-700/50 pt-3">
          <p className="text-sm text-slate-400">{match.tournamentName}</p>
          {commonDays.length > 0 && (
            <p className="text-xs text-green-400 mt-1">{commonDays.join(" - ")}</p>
          )}
        </div>
      </div>
    )
  }

  const renderRecentMatch = (match: MatchData) => {
    const player1Details = playerDetailsMap.get(match.player1Ci)
    const player2Details = playerDetailsMap.get(match.player2Ci)

    const player1CareerName = player1Details ? careerMap.get(player1Details.career_id) : "Cargando..."
    const player2CareerName = player2Details ? careerMap.get(player2Details.career_id) : "Cargando..."

    const player1ShortName = getShortName(match.player1Name)
    const player2ShortName = getShortName(match.player2Name)

    return (
      <div key={match.id} className="bg-[#2A2A3E] p-4 rounded-2xl border border-slate-700/50 relative">
        {/* Match ID */}
        <span className="absolute top-2 right-2 text-[10px] text-slate-800">#{match.id}</span>
        {/* Grid layout for match info */}
        <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center mb-4">
          {/* Player 1 */}
          <Link href={`/players/${match.player1Ci}`} className="grid grid-cols-[48px_1fr] gap-3 items-center hover:opacity-80 transition-opacity">
            <Image 
              src={match.player1Avatar || "/placeholder-user.jpg"} 
              alt={match.player1Name} 
              width={48} 
              height={48} 
              className="rounded-full w-12 h-12" 
              unoptimized 
            />
            <div className="min-w-0">
              <p className="font-bold text-white text-sm truncate hover:text-purple-400 transition-colors">{player1ShortName}</p>
              {player1Details && (
                <>
                  <p className="text-xs text-slate-400">Aura: {player1Details.aura}</p>
                  <p className="text-xs text-slate-400 truncate">Carrera: {player1CareerName}</p>
                </>
              )}
            </div>
          </Link>

          {/* Score */}
          <div className="text-center px-4">
            <p className="text-xl font-bold whitespace-nowrap">
              <span className={match.score1 > match.score2 ? "text-white" : "text-slate-400"}>{match.score1}</span>
              <span className="text-slate-500 mx-2">VS</span>
              <span className={match.score2 > match.score1 ? "text-white" : "text-slate-400"}>{match.score2}</span>
            </p>
          </div>

          {/* Player 2 */}
          <Link href={`/players/${match.player2Ci}`} className="grid grid-cols-[1fr_48px] gap-3 items-center hover:opacity-80 transition-opacity">
            <div className="text-right min-w-0">
              <p className="font-bold text-white text-sm truncate hover:text-purple-400 transition-colors">{player2ShortName}</p>
              {player2Details && (
                <>
                  <p className="text-xs text-slate-400">Aura: {player2Details.aura}</p>
                  <p className="text-xs text-slate-400 truncate">Carrera: {player2CareerName}</p>
                </>
              )}
            </div>
            <Image 
              src={match.player2Avatar || "/placeholder-user.jpg"} 
              alt={match.player2Name} 
              width={48} 
              height={48} 
              className="rounded-full w-12 h-12" 
              unoptimized 
            />
          </Link>
        </div>

        {/* Tournament info */}
        <div className="text-center border-t border-slate-700/50 pt-3 mb-3">
          <p className="text-sm text-slate-400">{match.tournamentName}</p>
          <p className="text-xs text-slate-500">{formatMatchDate(match.updatedAt)}</p>
        </div>

        {/* Sets */}
        <div className="flex justify-center gap-2 flex-wrap">
          {match.sets
            .filter((set) => !(set.p1 === 0 && set.p2 === 0))
            .map((set, index) => (
              <div key={index} className={`px-3 py-1 rounded text-sm font-semibold ${set.p1 > set.p2 ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                {set.p1}-{set.p2}
              </div>
            ))}
        </div>
      </div>
    )
  }

  const isLoading = upcomingLoading || recentLoading || loadingPlayerDetails || loadingCareers;

  return (
    <>
      <section className="bg-[#2A2A3E] p-5 mt-5 mb-5 rounded-2xl border border-slate-700/50 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-white">Próximos Partidos</h4>
          {!isLoading && <span className="text-xs text-slate-400">{upcomingMatches.length} partidos</span>}
        </div>
        {isLoading ? (
          <p>Loading...</p>
        ) : upcomingError ? (
          <p className="text-sm text-red-500">Error al cargar los próximos partidos.</p>
        ) : upcomingMatches.length > 0 ? (
          <div className="space-y-4">{upcomingMatches.map(renderUpcomingMatch)}</div>
        ) : (
          <p className="text-sm text-slate-400">No se encontraron partidos próximos.</p>
        )}
      </section>

      <section className="bg-[#2A2A3E] p-5 mt-5 mb-15 rounded-2xl border border-slate-700/50 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-white">Últimos Partidos</h4>
          {!isLoading && <span className="text-xs text-slate-400">{recentMatches.length} partidos</span>}
        </div>
        {isLoading ? (
          <p>Loading...</p>
        ) : recentError ? (
          <p className="text-sm text-red-500">Error al cargar los últimos partidos.</p>
        ) : recentMatches.length > 0 ? (
          <div className="space-y-4">{recentMatches.map(renderRecentMatch)}</div>
        ) : (
          <p className="text-sm text-slate-400">No se encontraron partidos recientes.</p>
        )}
      </section>
    </>
  )
}

export default PlayerMatches
