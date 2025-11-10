"use client"

import React from "react"
import PlayerProfile from "@/components/PlayerProfile"
import PlayerMatches from "@/components/PlayerMatches"
import PlayerStatsTabs from "@/components/PlayerStatsTabs"
import { usePlayerMatches } from "@/hooks/usePlayerMatches"
import { useTournaments } from "@/hooks/useTournaments"

export default function Page({ params }: { params: { ci: string } }) {
  const { ci } = params

  // Usar el hook para obtener todos los partidos del jugador (finalizados y no finalizados)

  const { matches, loading } = usePlayerMatches(ci)
  const { tournaments, loading: loadingTournaments } = useTournaments()

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Layout: profile on the left, stats on the right (same vertical space) */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_360px] gap-6 items-start">
        <div>
          <PlayerProfile ci={ci} />
        </div>

        <div>
          {/* Mostrar pestañas de estadísticas solo cuando los partidos y torneos estén cargados */}
          {!loading && !loadingTournaments && (
            <PlayerStatsTabs matches={matches} tournaments={tournaments} />
          )}
        </div>
      </div>

      <div className="mt-6">
        <PlayerMatches playerId={ci} />
      </div>
    </div>
  )
}
