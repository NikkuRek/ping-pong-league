"use client"
import React, { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import PlayerListRadar from "./PlayerListRadar"
import PlayerList from "./PlayerList"
import { Trophy, Target } from "lucide-react"

const PlayerRanking: React.FC = () => {
    const { player, isLoggedIn } = useAuth()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const showLoggedInState = mounted && isLoggedIn

    return (
        <section className="mb-12 relative animate-fade-in-up" style={{ animationDelay: '0.8s', animationFillMode: 'both' }}>
            {/* Background elements for ranking */}
            <div className="absolute top-10 right-0 w-72 h-72 bg-purple-600/5 blur-[100px] rounded-full pointer-events-none -z-10" />
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-600/5 blur-[100px] rounded-full pointer-events-none -z-10" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 px-2">
                <div className="flex items-center gap-3">
                    <div className="bg-yellow-500/10 p-2.5 rounded-xl border border-yellow-500/20 shadow-[0_0_15px_-3px_rgba(234,179,8,0.2)]">
                        {showLoggedInState ? <Target className="w-6 h-6 text-yellow-500" /> : <Trophy className="w-6 h-6 text-yellow-500" />}
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                        {showLoggedInState ? "Tu Zona de Guerra" : "Ranking de Jugadores (Top 10)"}
                    </h2>
                </div>
            </div>
            
            <div className="bg-[#1E1E2E]/60 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-2xl p-4 md:p-6 pb-2 transition-all hover:border-slate-600/50">
                {showLoggedInState ? (
                    <PlayerListRadar targetCi={player?.ci || ""} />
                ) : (
                    <PlayerList 
                        limit={10}
                        showFilters={false}
                        showPagination={false}
                        showTitle={false}
                    />
                )}
            </div>
        </section>
    )
}

export default PlayerRanking
