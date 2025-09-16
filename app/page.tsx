"use client"

import type React from "react"
import Welcome from "@/components/Welcome"
import RecentMatches from "@/components/RecentMatches"
import PlayerList from "@/components/PlayerList"

export default function Home() {
  return (
    <div className="space-y-8">
      <Welcome />
      <PlayerList />
      <RecentMatches />
    </div>
  )
}
