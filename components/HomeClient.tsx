"use client"

import type React from "react"
import Welcome from "@/components/Welcome"
// import RecentMatches from "@/components/RecentMatches"
import PlayerRanking from "@/components/PlayerRanking"

export default function HomeClient() {
  return (
    <div className="space-y-8">
      <div className="mb-20" >
        <Welcome />
        <PlayerRanking />
        {/* <RecentMatches /> */}
      </div>
    </div>
  )
}
