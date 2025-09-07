"use client"

import { useState } from "react"
import { Layout } from "@/components/layout"
import { DashboardView } from "@/components/views/dashboard-view"
import { UsersView } from "@/components/views/users-view"
import { TournamentsView } from "@/components/views/tournaments-view"
import { MatchesView } from "@/components/views/matches-view"

export default function Home() {
  const [activeTab, setActiveTab] = useState("dashboard")

  const renderView = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardView />
      case "usuarios":
        return <UsersView />
      case "torneos":
        return <TournamentsView />
      case "partidos":
        return <MatchesView />
      default:
        return <DashboardView />
    }
  }

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderView()}
    </Layout>
  )
}
