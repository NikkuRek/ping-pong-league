"use client"

import React, { useState } from "react"
import MatchHistory from "./MatchHistory"
import PlayerStats from "./PlayerStats"
import MatchConsensusPanel from "./MatchConsensusPanel"
import { History, BarChart3, CheckSquare } from "lucide-react"

interface ProfileTabsProps {
  playerId: string
  isOwnProfile?: boolean
}

const ProfileTabs: React.FC<ProfileTabsProps> = ({ playerId, isOwnProfile = false }) => {
  const [activeTab, setActiveTab] = useState<"history" | "stats" | "consensus">("history")

  const tabs = [
    { id: "history", label: "Historial", icon: History },
    { id: "stats", label: "Estadísticas", icon: BarChart3 },
    ...(isOwnProfile ? [{ id: "consensus", label: "Consenso", icon: CheckSquare }] : []),
  ] as const

  return (
    <div className="space-y-6">
      {/* Tabs Navigation */}
      <div className="flex p-1 bg-[#232335] rounded-xl border border-slate-700/50">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-all duration-200 rounded-lg
                ${isActive 
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-900/20" 
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/30"
                }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-500"}`} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
        {activeTab === "history" && <MatchHistory playerId={playerId} />}
        {activeTab === "stats" && <PlayerStats playerId={playerId} />}
        {activeTab === "consensus" && isOwnProfile && <MatchConsensusPanel playerCI={playerId} />}
      </div>
    </div>
  )
}

export default ProfileTabs
