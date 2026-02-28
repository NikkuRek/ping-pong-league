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
import { ChevronDown } from "lucide-react"

const getShortName = (fullName: string): string => {
  if (!fullName) return "—"
  const names = fullName.trim().split(/\s+/).filter((n) => n.length > 0)
  if (names.length === 0) return "—"
  if (names.length === 1) return names[0]
  const firstName = names[0]
  const midPoint = Math.ceil(names.length / 2)
  const firstLastName = names[midPoint] || names[1]
  return `${firstName} ${firstLastName}`
}

const MatchHistory: React.FC<{ playerId?: string }> = ({ playerId }) => {
  const { matches, allMatches, loading: matchesLoading, error: matchesError, hasMore, total, loadMore } = useAllMatches()
  
  // Local display count for Player profile (10 by 10)
  const [profileDisplayCount, setProfileDisplayCount] = useState(10)

  const [careerMap, setCareerMap] = useState<Map<number, string>>(new Map())
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [playerDetailsMap, setPlayerDetailsMap] = useState<Map<string, PlayerBackendResponse>>(new Map())
  const [loadingCareers, setLoadingCareers] = useState(true)
  const [loadingTournaments, setLoadingTournaments] = useState(true)
  const [loadingPlayerDetails, setLoadingPlayerDetails] = useState(false)

  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [tournamentFilter, setTournamentFilter] = useState<string>("all")
  const [playerSearch, setPlayerSearch] = useState<string>("")
  const [sortBy, setSortBy] = useState<string>("date-desc")

  // Fetch careers and tournaments once
  useEffect(() => {
    const apiUrl = getApiUrl()

    fetch(`${apiUrl}/career`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (!data) return
        const map = new Map<number, string>()
        ;(data.data || []).forEach((c: Career) => map.set(c.career_id, c.name_career))
        setCareerMap(map)
      })
      .catch(console.error)
      .finally(() => setLoadingCareers(false))

    fetch(`${apiUrl}/tournament`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (data) setTournaments(data.data || []) })
      .catch(console.error)
      .finally(() => setLoadingTournaments(false))
  }, [])

  // Lazily fetch player details only for CIs not yet in the map
  useEffect(() => {
    if (matchesLoading || allMatches.length === 0) return

    const missing = new Set<string>()
    allMatches.forEach((m) => {
      if (m.player1Ci && !playerDetailsMap.has(m.player1Ci)) missing.add(m.player1Ci)
      if (m.player2Ci && !playerDetailsMap.has(m.player2Ci)) missing.add(m.player2Ci)
    })
    if (missing.size === 0) return

    setLoadingPlayerDetails(true)
    const apiUrl = getApiUrl()

    Promise.all(
      Array.from(missing).map((ci) =>
        fetch(`${apiUrl}/player/${ci}`)
          .then((r) => r.ok ? r.json() : null)
          .then((json) => {
            const pd = json?.data ?? json?.player ?? null
            return pd ? ([ci, pd] as [string, PlayerBackendResponse]) : null
          })
          .catch(() => null)
      )
    ).then((results) => {
      setPlayerDetailsMap((prev) => {
        const next = new Map(prev)
        results.forEach((entry) => { if (entry) next.set(entry[0], entry[1]) })
        return next
      })
    }).finally(() => setLoadingPlayerDetails(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allMatches, matchesLoading])

  // Apply filters/sort to the FULL dataset
  const filteredAndSortedMatches = useMemo(() => {
    let filtered = [...allMatches]

    if (statusFilter !== "all") {
      if (statusFilter === "Finalizado") filtered = filtered.filter((m) => m.status === "Finalizado")
      else filtered = filtered.filter((m) => m.status !== "Finalizado")
    }

    if (tournamentFilter !== "all") {
      filtered = filtered.filter((m) => m.tournamentId.toString() === tournamentFilter)
    }

    if (playerSearch.trim() !== "") {
      const s = playerSearch.toLowerCase().trim()
      filtered = filtered.filter(
        (m) =>
          m.player1Name.toLowerCase().includes(s) ||
          m.player2Name.toLowerCase().includes(s) ||
          m.player1Ci.includes(s) ||
          m.player2Ci.includes(s)
      )
    }

    if (sortBy === "date-asc") filtered.sort((a, b) => new Date(a.matchDatetime).getTime() - new Date(b.matchDatetime).getTime())
    else if (sortBy === "date-desc") filtered.sort((a, b) => new Date(b.matchDatetime).getTime() - new Date(a.matchDatetime).getTime())
    else if (sortBy === "tournament") filtered.sort((a, b) => a.tournamentName.localeCompare(b.tournamentName))

    return filtered
  }, [allMatches, statusFilter, tournamentFilter, playerSearch, sortBy])

  // Player-specific filter
  const playerProfileMatches = useMemo(() => {
    if (!playerId) return []
    return filteredAndSortedMatches.filter(m => m.player1Ci === playerId || m.player2Ci === playerId)
  }, [filteredAndSortedMatches, playerId])

  const isFiltering = statusFilter !== "all" || tournamentFilter !== "all" || playerSearch.trim() !== ""

  // When filters active: show all filtered results (they're already a subset)
  // When no filters: respect pagination slice
  const visibleMatches = playerId 
    ? playerProfileMatches.slice(0, profileDisplayCount)
    : (isFiltering ? filteredAndSortedMatches : matches)

  const hasMoreInProfile = playerId ? profileDisplayCount < playerProfileMatches.length : false

  const renderMatch = (match: AllMatchData) => {
    const p1 = playerDetailsMap.get(match.player1Ci)
    const p2 = playerDetailsMap.get(match.player2Ci)
    const p1Career = p1 ? careerMap.get(p1.career_id) : undefined
    const p2Career = p2 ? careerMap.get(p2.career_id) : undefined
    const p1Short = getShortName(match.player1Name)
    const p2Short = getShortName(match.player2Name)
    const isFinished = match.status === "Finalizado"

    return (
      <div key={match.id} className="bg-[#2A2A3E] p-4 rounded-2xl border border-slate-700/50 relative">
        <span className="absolute top-2 right-2 text-[10px] text-slate-600">#{match.id}</span>
        <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center mb-4">
          {/* Player 1 */}
          <Link href={`/players/detail?ci=${match.player1Ci}`} className="grid grid-cols-[48px_1fr] gap-3 items-center hover:opacity-80 transition-opacity">
            <Image
              src={match.player1Avatar || `https://api.dicebear.com/9.x/avataaars/svg?seed=${match.player1Ci}`}
              alt={match.player1Name}
              width={48} height={48}
              className="rounded-full w-12 h-12 object-cover bg-slate-800"
              unoptimized
            />
            <div className="min-w-0">
              <p className="font-bold text-white truncate hover:text-purple-400 transition-colors">{p1Short}</p>
              {p1 && (
                <>
                  <p className="text-xs text-slate-400">Aura: {p1.aura}</p>
                  <p className="text-xs text-slate-400 truncate">{p1Career ?? "—"}</p>
                </>
              )}
            </div>
          </Link>

          {/* Score */}
          <div className="text-center px-4">
            <p className="text-2xl font-bold whitespace-nowrap">
              <span className={isFinished && match.score1 > match.score2 ? "text-white" : "text-slate-400"}>{match.score1}</span>
              <span className="text-slate-500 mx-2">VS</span>
              <span className={isFinished && match.score2 > match.score1 ? "text-white" : "text-slate-400"}>{match.score2}</span>
            </p>
            <p className={`text-xs mt-1 ${match.status === "Finalizado" ? "text-green-400" : "text-yellow-400"}`}>
              {match.status}
            </p>
          </div>

          {/* Player 2 */}
          <Link href={`/players/detail?ci=${match.player2Ci}`} className="grid grid-cols-[1fr_48px] gap-3 items-center hover:opacity-80 transition-opacity">
            <div className="text-right min-w-0">
              <p className="font-bold text-white truncate hover:text-purple-400 transition-colors">{p2Short}</p>
              {p2 && (
                <>
                  <p className="text-xs text-slate-400">Aura: {p2.aura}</p>
                  <p className="text-xs text-slate-400 truncate">{p2Career ?? "—"}</p>
                </>
              )}
            </div>
            <Image
              src={match.player2Avatar || `https://api.dicebear.com/9.x/avataaars/svg?seed=${match.player2Ci}`}
              alt={match.player2Name}
              width={48} height={48}
              className="rounded-full w-12 h-12 object-cover bg-slate-800"
              unoptimized
            />
          </Link>
        </div>

        <div className="text-center border-t border-slate-700/50 pt-3 mb-3">
          <p className="text-sm text-slate-400">{match.tournamentName}</p>
          <p className="text-xs text-slate-500">{match.round} • {match.timeAgo}</p>
        </div>

        {isFinished && (
          <div className="flex justify-center gap-2 flex-wrap">
            {match.sets
              .filter((s) => !(s.p1 === 0 && s.p2 === 0))
              .map((s, i) => (
                <div
                  key={i}
                  className={`px-3 py-1 rounded text-sm font-semibold ${
                    s.p1 > s.p2 ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                  }`}
                >
                  {s.p1}-{s.p2}
                </div>
              ))}
          </div>
        )}
      </div>
    )
  }

  const isInitialLoading = matchesLoading || loadingCareers || loadingTournaments
  const hasActiveFilters = isFiltering

  return (
    <div className="space-y-6">
      {/* Filters (only if not in player profile view) */}
      {!playerId && (
        <div className="bg-[#2A2A3E] p-5 rounded-2xl border border-slate-700/50 space-y-4">
          <h3 className="text-lg font-semibold text-white">Filtros</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

            <div>
              <label className="text-sm text-slate-400 mb-2 block">Torneo</label>
              <Select value={tournamentFilter} onValueChange={setTournamentFilter}>
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {tournaments.map((t) => (
                    <SelectItem key={t.tournament_id} value={t.tournament_id.toString()}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

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

          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              disabled={!hasActiveFilters}
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
      )}

      {/* Matches */}
      <section className={`${!playerId ? "bg-[#2A2A3E] p-5 rounded-2xl border border-slate-700/50" : ""} space-y-4`}>
        {!playerId && (
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-white">Historial de Partidos</h4>
            {!isInitialLoading && (
              <span className="text-xs text-slate-400">
                {isFiltering
                  ? `${filteredAndSortedMatches.length} resultado${filteredAndSortedMatches.length !== 1 ? "s" : ""}`
                  : `Mostrando ${visibleMatches.length} de ${total}`}
              </span>
            )}
          </div>
        )}

        {isInitialLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : matchesError ? (
          <p className="text-sm text-red-500">Error al cargar los partidos.</p>
        ) : visibleMatches.length > 0 ? (
          <>
            <div className="space-y-4">{visibleMatches.map(renderMatch)}</div>

            {/* Load more */}
            {((!playerId && !isFiltering && hasMore) || (playerId && hasMoreInProfile)) && (
              <div className="pt-2 text-center">
                <Button
                  variant="outline"
                  onClick={playerId ? () => setProfileDisplayCount(prev => prev + 10) : loadMore}
                  className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700 gap-2"
                >
                  <ChevronDown className="w-4 h-4" />
                  Cargar más partidos
                </Button>
              </div>
            )}

            {loadingPlayerDetails && (
              <p className="text-xs text-center text-slate-500 animate-pulse">Cargando detalles de jugadores…</p>
            )}
          </>
        ) : (
          <p className="text-sm text-slate-400">
            {isFiltering ? "No se encontraron partidos con los filtros seleccionados." : "No hay partidos registrados."}
          </p>
        )}
      </section>
    </div>
  )
}

export default MatchHistory
