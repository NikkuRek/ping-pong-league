"use client"

import type React from "react"
import PlayerList from "@/components/PlayerList"

export default function PlayersClient() {
  return (
    <div className="container mx-auto px-4 py-6">
      <PlayerList />
    </div>
  )
}
