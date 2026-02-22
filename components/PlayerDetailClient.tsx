"use client"

import React from "react"
import { useSearchParams } from "next/navigation"
import PlayerProfile from "@/components/PlayerProfile"
import ProfileTabs from "@/components/ProfileTabs"

export default function PlayerDetailClient() {
  const searchParams = useSearchParams()
  const ci = searchParams.get("ci")

  // Usar el hook para obtener todos los partidos del jugador (finalizados y no finalizados)

  if (!ci) {
    return (
      <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">
        No se especificó un jugador.
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <PlayerProfile ci={ci} />
      <ProfileTabs playerId={ci} isOwnProfile={false} />
    </div>
  )
}
