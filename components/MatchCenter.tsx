"use client"

import React, { useState } from "react"
import { useAllMatches } from "@/hooks/useAllMatches"
import { Swords, Clock, MoveUpRight } from "lucide-react"
import Link from "next/link"

const getShortName = (fullName: string): string => {
  if (!fullName) return "—"
  const names = fullName.trim().split(/\s+/).filter((n) => n.length > 0)
  if (names.length === 0) return "—"
  if (names.length === 1) return names[0]
  const firstName = names[0]
  const midPoint = Math.ceil(names.length / 2)
  const firstLastName = names[midPoint] || names[1]
  return `${firstName} ${firstLastName}`
}

export default function MatchCenter() {
  const { matches, allMatches, loading, error } = useAllMatches()
  const [activeTab, setActiveTab] = useState<"proximos" | "resultados">("proximos")

  if (loading) {
    return <div className="h-64 bg-slate-800/30 rounded-2xl animate-pulse"></div>
  }
  if (error) return null

  // Process data for the tabs
  const upcomingMatches = allMatches.filter(m => m.status === "Pendiente" || m.status === "Propuesto")
  const upcomingSorted = upcomingMatches.sort((a,b) => new Date(a.matchDatetime).getTime() - new Date(b.matchDatetime).getTime()).slice(0, 4)
  const matchOfTheWeek = upcomingSorted.length > 0 ? upcomingSorted[0] : null

  const resultsMatches = allMatches.filter(m => m.status === "Finalizado")
  const resultsSorted = resultsMatches.sort((a,b) => new Date(b.matchDatetime).getTime() - new Date(a.matchDatetime).getTime()).slice(0, 4)

  const renderMatchCard = (m: any, isFinished: boolean) => {
    const p1Won = m.score1 > m.score2
    const p2Won = m.score2 > m.score1

    return (
      <Link href={`/tournaments/detail?id=${m.tournamentId}`} key={m.id} className="block group">
        <div className="bg-[#2A2A3E]/80 group-hover:bg-[#2A2A3E] p-4 rounded-2xl border border-slate-700/50 group-hover:border-purple-500/50 transition-all mb-3 relative overflow-hidden">
          {isFinished && m.timeAgo && (
             <div className="absolute top-0 right-0 p-1.5 px-3 bg-slate-800/80 rounded-bl-lg border-l border-b border-slate-700/50 flex items-center gap-1">
                <span className="text-[10px] text-slate-400">{m.timeAgo}</span>
             </div>
          )}
          <div className="grid grid-cols-[1fr_auto_1fr] gap-2 md:gap-4 items-center mb-3 mt-1">
            {/* Player 1 */}
            <div className="grid grid-cols-[36px_1fr] sm:grid-cols-[48px_1fr] gap-2 sm:gap-3 items-center">
              <img src={m.player1Avatar || `https://api.dicebear.com/9.x/avataaars/svg?seed=${m.player1Ci}`} alt="P1" className={`rounded-full w-9 h-9 sm:w-12 sm:h-12 object-cover border-2 ${isFinished && p1Won ? 'border-purple-500/50' : 'border-slate-700/50'}`} />
              <div className="min-w-0">
                <p className={`font-bold truncate text-xs sm:text-base transition-colors ${isFinished && p1Won ? 'text-white' : 'text-slate-300'}`}>{getShortName(m.player1Name)}</p>
              </div>
            </div>

            {/* Score / Center */}
            <div className="text-center px-1 sm:px-4">
              {isFinished ? (
                 <>
                  <p className="text-lg sm:text-2xl font-bold whitespace-nowrap">
                    <span className={p1Won ? "text-white" : "text-slate-400"}>{m.score1}</span>
                    <span className="text-slate-500 mx-1 sm:mx-2">-</span>
                    <span className={p2Won ? "text-white" : "text-slate-400"}>{m.score2}</span>
                  </p>
                  <p className="text-[9px] sm:text-xs mt-0.5 text-green-400/80 font-medium">Finalizado</p>
                 </>
              ) : (
                 <div className="flex flex-col items-center">
                   <p className="text-lg sm:text-2xl font-black text-slate-600 italic mb-0.5">VS</p>
                   <div className="text-[9px] sm:text-[11px] text-blue-400 font-medium whitespace-nowrap bg-blue-500/10 px-2 py-0.5 rounded flex items-center gap-1">
                     <Clock className="w-2.5 h-2.5" /> {new Date(m.matchDatetime).toLocaleDateString()}
                   </div>
                 </div>
              )}
            </div>

            {/* Player 2 */}
            <div className="grid grid-cols-[1fr_36px] sm:grid-cols-[1fr_48px] gap-2 sm:gap-3 items-center">
              <div className="text-right min-w-0">
                <p className={`font-bold truncate text-xs sm:text-base transition-colors ${isFinished && p2Won ? 'text-white' : 'text-slate-300'}`}>{getShortName(m.player2Name)}</p>
              </div>
              <img src={m.player2Avatar || `https://api.dicebear.com/9.x/avataaars/svg?seed=${m.player2Ci}`} alt="P2" className={`rounded-full w-9 h-9 sm:w-12 sm:h-12 object-cover border-2 ${isFinished && p2Won ? 'border-purple-500/50' : 'border-slate-700/50'}`} />
            </div>
          </div>

          <div className="text-center border-t border-slate-700/50 pt-2.5">
            <p className="text-xs sm:text-sm text-slate-400 truncate px-4 text-center">{m.tournamentName}</p>
            <p className="text-[10px] sm:text-xs text-slate-500">{m.round}</p>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <section className="mb-12 animate-fade-in-up" style={{ animationDelay: '0.4s', animationFillMode: 'both' }}>
       <div className="flex items-center gap-3 mb-6 px-2">
           <div className="bg-blue-500/10 p-2.5 rounded-xl border border-blue-500/20 shadow-[0_0_15px_-3px_rgba(59,130,246,0.2)]">
               <Swords className="w-6 h-6 text-blue-500" />
           </div>
           <h2 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
               Match Center
           </h2>
       </div>

      <div className="bg-[#1E1E2E]/60 backdrop-blur-xl rounded-vxl border border-slate-700/50 shadow-2xl overflow-hidden rounded-2xl">
        {/* Tabs Header */}
        <div className="flex border-b border-slate-700/50">
          <button 
            onClick={() => setActiveTab("proximos")}
            className={`flex-1 py-4 text-center font-bold text-sm md:text-base transition-colors ${activeTab === 'proximos' ? 'bg-blue-600/10 text-blue-400 border-b-2 border-blue-500' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}
          >
            Cartelera
          </button>
          <button 
            onClick={() => setActiveTab("resultados")}
            className={`flex-1 py-4 text-center font-bold text-sm md:text-base transition-colors ${activeTab === 'resultados' ? 'bg-purple-600/10 text-purple-400 border-b-2 border-purple-500' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}
          >
            Últimos Resultados
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-4 md:p-6 bg-slate-900/30">
          {activeTab === "proximos" && (
            <div className="space-y-4">
              {upcomingSorted.length === 0 ? (
                <p className="text-slate-400 text-center py-8">No hay partidos próximos programados.</p>
              ) : (
                <div className="flex flex-col gap-1">
                  {/* Match of the week highlight */}
                  {matchOfTheWeek && (
                    <div className="relative overflow-hidden bg-gradient-to-r from-blue-900/40 to-indigo-900/40 border border-blue-500/30 rounded-xl p-6 mb-4">
                      <div className="absolute top-0 right-0 p-2 bg-blue-500 text-white text-[10px] md:text-xs font-bold rounded-bl-lg uppercase tracking-wider">Partido Destacado</div>
                      <div className="flex justify-between items-center text-xs md:text-sm text-blue-200/70 mb-4 font-medium px-2 mt-2 md:mt-4">
                        <span className="truncate pr-4">{matchOfTheWeek.tournamentName}</span>
                        <span className="flex items-center gap-1 whitespace-nowrap"><Clock className="w-3.5 h-3.5" /> {new Date(matchOfTheWeek.matchDatetime).toLocaleDateString()}</span>
                      </div>
                      <div className="grid grid-cols-[1fr,auto,1fr] gap-2 md:gap-4 items-center px-2 md:px-10">
                         <div className="flex flex-col items-center gap-2 md:gap-3">
                           <img src={matchOfTheWeek.player1Avatar || `https://api.dicebear.com/9.x/avataaars/svg?seed=${matchOfTheWeek.player1Ci}`} alt="P1" className="w-14 h-14 md:w-20 md:h-20 rounded-full border-2 border-blue-500/50 shadow-lg shadow-blue-500/20 object-cover" />
                           <span className="font-bold text-white text-center text-xs md:text-base">{getShortName(matchOfTheWeek.player1Name)}</span>
                         </div>
                         <div className="text-2xl md:text-3xl font-black text-slate-500 tracking-widest italic flex items-center justify-center">
                           <span className="text-blue-500/70 mx-1 md:mx-2">VS</span>
                         </div>
                         <div className="flex flex-col items-center gap-2 md:gap-3">
                           <img src={matchOfTheWeek.player2Avatar || `https://api.dicebear.com/9.x/avataaars/svg?seed=${matchOfTheWeek.player2Ci}`} alt="P2" className="w-14 h-14 md:w-20 md:h-20 rounded-full border-2 border-blue-500/50 shadow-lg shadow-blue-500/20 object-cover" />
                           <span className="font-bold text-white text-center text-xs md:text-base">{getShortName(matchOfTheWeek.player2Name)}</span>
                         </div>
                      </div>
                    </div>
                  )}

                  {/* Rest of upcoming matches */}
                  {upcomingSorted.slice(1).map((m) => renderMatchCard(m, false))}
                </div>
              )}
            </div>
          )}

          {activeTab === "resultados" && (
            <div className="flex flex-col">
              {resultsSorted.length === 0 ? (
                <p className="text-slate-400 text-center py-8">No hay resultados recientes.</p>
              ) : (
                resultsSorted.map((m) => renderMatchCard(m, true))
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
