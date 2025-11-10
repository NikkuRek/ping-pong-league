"use client"

import type React from "react"
import { useState, useMemo } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import type { PlayerForList } from "@/types"
import { usePlayers } from "@/hooks/usePlayers"
import { Input } from "@/components/ui/input"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { ErrorMessage } from "@/components/ui/error-message"

interface PlayerListProps {
  limit?: number
  showFilters?: boolean
  showPagination?: boolean
  showTitle?: boolean
}

// El componente PlayerItem se mantiene igual
const PlayerItem: React.FC<{ player: PlayerForList; rank: number }> = ({ player, rank }) => {
  const router = useRouter()

  // Get only the first word before any whitespace for first and last names
  const firstName = player.first_name?.trim().split(/\s+/)[0] ?? ""
  const lastName = player.last_name?.trim().split(/\s+/)[0] ?? ""

  const rankGradients: { [key: number]: string } = {
    0: "bg-gradient-to-r from-[#FFD700] to-[#FFECB3]", // Gold
    1: "bg-gradient-to-r from-[#C0C0C0] to-[#E0E0E0]", // Silver
    2: "bg-gradient-to-r from-[#CD7F32] to-[#FFAB73]", // Bronze
  }

  const rankNameColors: { [key: number]: string } = {
    0: "text-amber-900",
    1: "text-slate-900",
    2: "text-orange-950",
  }
  const rankDetailsColors: { [key: number]: string } = {
    0: "text-amber-800",
    1: "text-slate-700",
    2: "text-orange-900",
  }
  const rankBorders: { [key: number]: string } = {
    0: "border-amber-200",
    1: "border-slate-200",
    2: "border-orange-200",
  }

  const backgroundClass = rankGradients[rank] || "bg-gradient-to-r from-[#4D2067] to-[#560485]"
  const nameColorClass = rankNameColors[rank] || "text-white"
  const detailsColorClass = rankDetailsColors[rank] || "text-slate-400"
  const borderClass = rankBorders[rank] || "border-violet-900"

  const openProfile = () => {
    router.push(`/players/${player.ci}`)
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      openProfile()
    }
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={openProfile}
      onKeyDown={onKeyDown}
      className={`flex items-center p-3 rounded-lg border ${borderClass} ${backgroundClass} cursor-pointer hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-purple-500 animate-fade-in`}
    >
      <div className="flex items-center justify-between w-full">
        {/* Left side - Avatar and player info */}
        <div className="flex items-center gap-12 flex-1">
          <Image
            src={player.avatar || "/placeholder.svg"}
            alt={`${firstName} ${lastName}`.trim()}
            width={40}
            height={40}
            className="rounded-full object-cover"
          />
          <div className="text-left">
            <p className={`font-semibold ${nameColorClass}`}>{`${firstName} ${lastName}`.trim()}</p>
            <p className={`text-xs ${detailsColorClass}`}>{player.career_name}</p>
          </div>
        </div>

        {/* Right side - Rank and aura */}
        <div className="text-right">
          <p className={`font-semibold ${nameColorClass}`}>Rank: {rank + 1}</p>
          <p className={`text-xs ${detailsColorClass}`}>Aura: {player.aura}</p>
        </div>
      </div>
    </div>
  )
}

const PlayerList: React.FC<PlayerListProps> = ({
  limit,
  showFilters = true,
  showPagination = true,
  showTitle = true,
}) => {
  const { players, loading, error } = usePlayers()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSemester, setSelectedSemester] = useState<string | null>(null)
  const [selectedCareer, setSelectedCareer] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const PLAYERS_PER_PAGE = 15

  const playerRankMap = useMemo(() => {
    const map = new Map<string, number>()
    players.forEach((player, index) => {
      map.set(player.ci, index + 1)
    })
    return map
  }, [players])

  const uniqueSemesters = useMemo(() => {
    const semesters = new Set<number>()
    players.forEach((player) => semesters.add(player.semester))
    return Array.from(semesters).sort((a, b) => a - b)
  }, [players])

  const uniqueCareers = useMemo(() => {
    const careers = new Set<string>()
    players.forEach((player) => careers.add(player.career_name))
    return Array.from(careers).sort()
  }, [players])

  const [selectedDay, setSelectedDay] = useState<string | null>(null)

  const uniqueDays = useMemo(() => {
    const days = new Map<string, string>()
    players.forEach((player) => {
      if (player.Days) {
        player.Days.forEach((day) => {
          days.set(day.day_id.toString(), day.day_name)
        })
      }
    })
    return Array.from(days.entries()).sort((a, b) => a[1].localeCompare(b[1]))
  }, [players])

  const filteredPlayers = useMemo(() => {
    let currentPlayers = players

    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase()
      currentPlayers = currentPlayers.filter(
        (p) =>
          p.first_name.toLowerCase().includes(lowerCaseSearchTerm) ||
          p.last_name.toLowerCase().includes(lowerCaseSearchTerm) ||
          p.ci.toLowerCase().includes(lowerCaseSearchTerm),
      )
    }

    if (selectedSemester) {
      currentPlayers = currentPlayers.filter((p) => p.semester === Number.parseInt(selectedSemester))
    }

    if (selectedCareer) {
      currentPlayers = currentPlayers.filter((p) => p.career_name === selectedCareer)
    }

    if (selectedDay) {
      currentPlayers = currentPlayers.filter((p) => p.Days?.some((day) => day.day_id.toString() === selectedDay))
    }

    // Aplicar límite si se especifica
    if (limit) {
      currentPlayers = currentPlayers.slice(0, limit)
    }

    return currentPlayers
  }, [players, searchTerm, selectedSemester, selectedCareer, selectedDay, limit])

  // Para paginación normal (sin límite)
  const totalPages = Math.ceil(filteredPlayers.length / PLAYERS_PER_PAGE)
  const startIndex = showPagination ? (currentPage - 1) * PLAYERS_PER_PAGE : 0
  const endIndex = showPagination ? startIndex + PLAYERS_PER_PAGE : filteredPlayers.length
  const playersOnPage = filteredPlayers.slice(startIndex, endIndex)

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <LoadingSpinner />
        <p className="text-slate-400">Cargando datos...</p>
      </div>
    )
  }

  if (error) {
    console.error("Error loading players:", error)
    return <ErrorMessage message="Error al cargar los jugadores." />
  }

  return (
    <section className="mb-12 shadow-lg">
      {showTitle && (
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-white">Jugadores</h2>
        </div>
      )}

      {showFilters && (
        <>
          <div className="mb-4 flex space-x-2">
            <Input
              placeholder="Buscar por nombre o CI..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              className="flex-grow"
            />
          </div>
          {/* Removed Select components since they were deleted */}
        </>
      )}

      <div className="space-y-3">
        {playersOnPage.length > 0 ? (
          playersOnPage.map((p, index) => <PlayerItem key={p.ci} player={p} rank={playerRankMap.get(p.ci)! - 1} />)
        ) : (
          <div className="text-center text-slate-400 py-8">No se encontraron jugadores.</div>
        )}
      </div>

      {showPagination && filteredPlayers.length > PLAYERS_PER_PAGE && (
        <div className="flex justify-center gap-2 mt-4">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 rounded-lg bg-gray-700 text-white disabled:bg-gray-500 disabled:cursor-not-allowed cursor-pointer hover:bg-gray-600 active:bg-gray-800"
          >
            Anterior
          </button>
          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentPage(index + 1)}
              className={`px-4 py-2 rounded-lg cursor-pointer ${currentPage === index + 1 ? "bg-purple-600 text-white hover:bg-purple-700 active:bg-purple-800" : "bg-gray-700 text-white hover:bg-gray-600 active:bg-gray-800"}`}
              aria-current={currentPage === index + 1 ? "page" : undefined}
            >
              {index + 1}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 rounded-lg bg-gray-700 text-white disabled:bg-gray-500 disabled:cursor-not-allowed cursor-pointer hover:bg-gray-600 active:bg-gray-800"
          >
            Siguiente
          </button>
        </div>
      )}
    </section>
  )
}

export default PlayerList
