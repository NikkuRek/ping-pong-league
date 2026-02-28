"use client"

import type React from "react"
import Welcome from "@/components/Welcome"
import TournamentStatusCards from "@/components/TournamentStatusCards"
import PlayerRanking from "@/components/PlayerRanking"
import MatchCenter from "@/components/MatchCenter"
import ActivityFeed from "@/components/ActivityFeed"

export default function HomeClient() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-24 flex flex-col gap-12 md:gap-16">
        <Welcome />
        <TournamentStatusCards />
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 max-w-full">
           <div className="lg:col-span-7 flex flex-col gap-12">
              <MatchCenter />
              <ActivityFeed />
           </div>
           
           <div className="lg:col-span-5 flex flex-col gap-12">
              <PlayerRanking />
           </div>
        </div>
      </div>
    </div>
  )
}
