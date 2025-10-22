"use client"

import type React from "react"
import { useState, useEffect, useMemo } from "react"
import Image from "next/image"
import Link from "next/link"
import { useAllMatches, type AllMatchData } from "@/hooks/useAllMatches"
import { Skeleton } from "./ui/skeleton"
import type { PlayerBackendResponse, Career, Tournament } from "@/types"
import { getApiUrl } from "@/lib/api-config"
import { Input } from "./ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Button } from "./ui/button"

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

const MatchHistory: React.FC = () => {
  const { matches: allMatches, loading: matchesLoading, error: matchesError } = useAllMatches()

  const [playerDetailsMap, setPlayerDetailsMap] = useState<Map<string, PlayerBackendResponse>>(new Map())
  const [careerMap, setCareerMap] = useState<Map<number, string>>(new Map())
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [loadingPlayerDetails, setLoadingPlayerDetails] = useState(true)
  const [loadingCareers, setLoadingCareers] = useState(true)
  const [loadingTournaments, setLoadingTournaments] = useState(true)

  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [tournamentFilter, setTournamentFilter] = useState<string>("all")
  const [playerSearch, setPlayerSearch] = useState<string>("")
  const [sortBy, setSortBy] = useState<string>("date-desc")

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
    const fetchTournaments = async () => {
      try {
        setLoadingTournaments(true)
        const apiUrl = getApiUrl()
        const response = await fetch(`${apiUrl}/tournament`)
        if (response.ok) {
          const data = await response.json()
          setTournaments(data.data || [])
        }
      } catch (err) {
        console.error("Error fetching tournaments:", err)
      } finally {
        setLoadingTournaments(false)
      }
    }
    fetchTournaments()
  }, [])

  useEffect(() => {
    const fetchDetails = async () => {
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
        if (!playerCi) continue
        try {
          const res = await fetch(`${apiUrl}/player/${playerCi}`)
          if (res.ok) {
            const json = await res.json()
            const pd = json.data ?? json.player ?? null
            if (pd) {
              newPlayerDetailsMap.set(playerCi, pd as PlayerBackendResponse)
            }
          }
        } catch (err) {
          console.error("Error fetching player", playerCi, err)
        }
      }

      setPlayerDetailsMap(newPlayerDetailsMap)
      setLoadingPlayerDetails(false)
    }

    if (!matchesLoading) {
      fetchDetails()
    }
  }, [allMatches, matchesLoading])

  // Filter and sort matches
  const filteredAndSortedMatches = useMemo(() => {
    let filtered = [...allMatches]

    // Status filter
    if (statusFilter !== "all") {
      if (statusFilter === "Finalizado") {
        filtered = filtered.filter(m => m.status === "Finalizado")
      } else if (statusFilter === "not-Finalizado") {
        filtered = filtered.filter(m => m.status !== "Finalizado")
      }
    }

    // Tournament filter
    if (tournamentFilter !== "all") {
      filtered = filtered.filter(m => m.tournamentId.toString() === tournamentFilter)
    }

    // Player search filter
    if (playerSearch.trim() !== "") {
      const searchLower = playerSearch.toLowerCase().trim()
      filtered = filtered.filter(m => {
        const player1NameMatch = m.player1Name.toLowerCase().includes(searchLower)
        const player2NameMatch = m.player2Name.toLowerCase().includes(searchLower)
        const player1CiMatch = m.player1Ci.includes(searchLower)
        const player2CiMatch = m.player2Ci.includes(searchLower)
        return player1NameMatch || player2NameMatch || player1CiMatch || player2CiMatch
      })
    }

    // Sorting
    if (sortBy === "date-desc") {
      filtered.sort((a, b) => new Date(b.matchDatetime).getTime() - new Date(a.matchDatetime).getTime())
    } else if (sortBy === "date-asc") {
      filtered.sort((a, b) => new Date(a.matchDatetime).getTime() - new Date(b.matchDatetime).getTime())
    } else if (sortBy === "tournament") {
      filtered.sort((a, b) => a.tournamentName.localeCompare(b.tournamentName))
    }

    return filtered
  }, [allMatches, statusFilter, tournamentFilter, playerSearch, sortBy])

  const renderMatch = (match: AllMatchData) => {
    const player1Details = playerDetailsMap.get(match.player1Ci)
    const player2Details = playerDetailsMap.get(match.player2Ci)

    const player1CareerName = player1Details ? careerMap.get(player1Details.career_id) : "—"
    const player2CareerName = player2Details ? careerMap.get(player2Details.career_id) : "—"

    const player1ShortName = getShortName(match.player1Name)
    const player2ShortName = getShortName(match.player2Name)

    const isFinished = match.status === "Finalizado"

    return (
      <div key={match.id} className="bg-[#2A2A3E] p-4 rounded-2xl border border-slate-700/50 relative">
        {/* Match ID */}
        <span className="absolute top-2 right-2 text-[10px] text-slate-600">#{match.id}</span>
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
              <p className="font-bold text-white truncate hover:text-purple-400 transition-colors">{player1ShortName}</p>
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
            <p className="text-2xl font-bold whitespace-nowrap">
              <span className={isFinished && match.score1 > match.score2 ? "text-white" : "text-slate-400"}>
                {match.score1}
              </span>
              <span className="text-slate-500 mx-2">VS</span>
              <span className={isFinished && match.score2 > match.score1 ? "text-white" : "text-slate-400"}>
                {match.score2}
              </span>
            </p>
            <p className={`text-xs mt-1 ${match.status === "Finalizado" ? "text-green-400" : "text-yellow-400"}`}>
              {match.status}
            </p>
          </div>

          {/* Player 2 */}
          <Link href={`/players/${match.player2Ci}`} className="grid grid-cols-[1fr_48px] gap-3 items-center hover:opacity-80 transition-opacity">
            <div className="text-right min-w-0">
              <p className="font-bold text-white truncate hover:text-purple-400 transition-colors">{player2ShortName}</p>
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
          <p className="text-xs text-slate-500">{match.round} • {match.timeAgo}</p>
        </div>

        {/* Sets */}
        {isFinished && (
          <div className="flex justify-center gap-2 flex-wrap">
            {match.sets
              .filter((set) => !(set.p1 === 0 && set.p2 === 0))
              .map((set, index) => (
                <div 
                  key={index} 
                  className={`px-3 py-1 rounded text-sm font-semibold ${
                    set.p1 > set.p2 ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                  }`}
                >
                  {set.p1}-{set.p2}
                </div>
              ))}
          </div>
        )}
      </div>
    )
  }

  const isLoading = matchesLoading || loadingPlayerDetails || loadingCareers || loadingTournaments

  return (
    <div className="space-y-6">
      {/* Filters Section */}
      <div className="bg-[#2A2A3E] p-5 rounded-2xl border border-slate-700/50 space-y-4">
        <h3 className="text-lg font-semibold text-white">Filtros</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Status Filter */}
          <div>
            <label className="text-sm text-slate-400 mb-2 block">Estado</label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="Finalizado">Finalizados</SelectItem>
                <SelectItem value="not-Finalizado">No Finalizados</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tournament Filter */}
          <div>
            <label className="text-sm text-slate-400 mb-2 block">Torneo</label>
            <Select value={tournamentFilter} onValueChange={setTournamentFilter}>
              <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {tournaments.map((tournament) => (
                  <SelectItem key={tournament.tournament_id} value={tournament.tournament_id.toString()}>
                    {tournament.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sort By */}
          <div>
            <label className="text-sm text-slate-400 mb-2 block">Ordenar por</label>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                <SelectValue placeholder="Fecha (Reciente)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-desc">Fecha (Reciente)</SelectItem>
                <SelectItem value="date-asc">Fecha (Antiguo)</SelectItem>
                <SelectItem value="tournament">Torneo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Player Search */}
          <div>
            <label className="text-sm text-slate-400 mb-2 block">Buscar Jugador</label>
            <Input
              type="text"
              placeholder="Nombre o cédula..."
              value={playerSearch}
              onChange={(e) => setPlayerSearch(e.target.value)}
              className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
            />
          </div>
        </div>

        {/* Clear Filters Button */}
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setStatusFilter("all")
              setTournamentFilter("all")
              setPlayerSearch("")
              setSortBy("date-desc")
            }}
            className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700"
          >
            Limpiar Filtros
          </Button>
        </div>
      </div>

      {/* Matches Section */}
      <section className="bg-[#2A2A3E] p-5 rounded-2xl border border-slate-700/50 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-white">Historial de Partidos</h4>
          {!isLoading && <span className="text-xs text-slate-400">{filteredAndSortedMatches.length} partidos</span>}
        </div>
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : matchesError ? (
          <p className="text-sm text-red-500">Error al cargar los partidos.</p>
        ) : filteredAndSortedMatches.length > 0 ? (
          <div className="space-y-4">{filteredAndSortedMatches.map(renderMatch)}</div>
        ) : (
          <p className="text-sm text-slate-400">No se encontraron partidos con los filtros seleccionados.</p>
        )}
      </section>
    </div>
  )
}

export default MatchHistory
