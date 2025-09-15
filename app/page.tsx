"use client"

import type React from "react"
import { useState } from "react"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import Welcome from "@/components/Welcome"
import InProgressTournaments from "@/components/InProgressTournaments"
import RecentMatches from "@/components/RecentMatches"
import PlayerRanking from "@/components/PlayerRanking"
import UpcomingTournaments from "@/components/UpcomingTournaments"
import MyProfile from "@/components/MyProfile"
import AdminPanel from "@/components/AdminPanel"

const UserDashboard: React.FC = () => {
  return (
    <div className="space-y-12">
      <Welcome />
      <InProgressTournaments />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <RecentMatches />
          <PlayerRanking />
        </div>
        <div className="lg:col-span-1 space-y-8">
          <UpcomingTournaments />
          <MyProfile />
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  const [isAdminView, setIsAdminView] = useState(false)

  return (
    <div className="min-h-screen text-white font-sans selection:bg-purple-500/30">
      <Header isAdminView={isAdminView} onToggleView={() => setIsAdminView((prev) => !prev)} />
      <main className="container mx-auto px-4 py-8">{isAdminView ? <AdminPanel /> : <UserDashboard />}</main>
      <Footer />
    </div>
  )
}
