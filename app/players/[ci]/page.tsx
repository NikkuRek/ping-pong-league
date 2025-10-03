import React from "react"
import PlayerProfile from "@/components/PlayerProfile"
import PlayerRecentMatches from "@/components/PlayerRecentMatches"
import UpcomingMatches from "@/components/UpcomingMatches"

export default function Page({ params }: { params: { ci: string } }) {
  const { ci } = params

  return (
    <div className="container mx-auto px-4 py-6">
      <PlayerProfile ci={ci} />
      <UpcomingMatches ci={ci} />
      <PlayerRecentMatches playerId={ci} />
    </div>
  )
}
