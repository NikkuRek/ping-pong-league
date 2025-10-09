"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { usePlayerMatches } from "@/hooks/usePlayerMatches"
import { Skeleton } from "./ui/skeleton"
import type { PlayerBackendResponse, Career, MatchData } from "@/types"
import { getApiUrl } from "@/lib/api-config"

interface PlayerMatchesProps {
  playerId: string
}

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
          if (res.ok) {
            const json = await res.json()
            const pd = json.data ?? json.player ?? null
            if (pd) {
              newPlayerDetailsMap.set(playerCi, pd as PlayerBackendResponse)
              fetchedCisRef.current.add(playerCi)
            }
          } else {
            console.error(`Failed to fetch player details for CI: ${playerCi}`)
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
      <div key={match.id} className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 flex flex-col sm:flex-row items-center justify-between">
        <div className="flex items-center gap-3 w-full sm:w-1/3">
          <Image src={match.player1Avatar || "/placeholder-user.jpg"} alt={match.player1Name} width={48} height={48} className="w-12 h-12 rounded-full object-cover" unoptimized />
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
          {commonDays.length > 0 ? (
            <p className="text-xs text-green-400 mt-1">{commonDays.join(" - ")}</p>
          ) : (
            <p></p>
          )}
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
          <Image src={match.player2Avatar || "/placeholder-user.jpg"} alt={match.player2Name} width={48} height={48} className="w-12 h-12 rounded-full object-cover" unoptimized />
        </div>
      </div>
    )
  }

  const renderRecentMatch = (match: MatchData) => {
    const player1Details = playerDetailsMap.get(match.player1Ci)
    const player2Details = playerDetailsMap.get(match.player2Ci)

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
            <Image src={match.player1Avatar || "/placeholder-user.jpg"} alt={match.player1Name} width={48} height={48} className="rounded-full" unoptimized />
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
              <span className={match.score1 > match.score2 ? "text-white" : "text-slate-400"}>{match.score1}</span>
              <span className="text-slate-500 mx-2">VS</span>
              <span className={match.score2 > match.score1 ? "text-white" : "text-slate-400"}>{match.score2}</span>
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
            <Image src={match.player2Avatar || "/placeholder-user.jpg"} alt={match.player2Name} width={48} height={48} className="rounded-full" unoptimized />
          </div>
        </div>
        <div className="text-center">
          <p className="text-sm text-slate-400">{match.tournamentName}</p>
          <p className="text-xs text-slate-500">{match.timeAgo}</p>
        </div>
        <div className="flex justify-center gap-2">
          {match.sets.map((set, index) => (
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