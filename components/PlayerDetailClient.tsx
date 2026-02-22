"use client"

import React from "react"
import PlayerProfile from "@/components/PlayerProfile"
import ProfileTabs from "@/components/ProfileTabs"

export default function PlayerDetailClient({ params }: { params: { ci: string } }) {
  const { ci } = params

  // Usar el hook para obtener todos los partidos del jugador (finalizados y no finalizados)

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <PlayerProfile ci={ci} />
      <ProfileTabs playerId={ci} isOwnProfile={false} />
    </div>
  )
}
