"use client"
import React, { useState, useEffect } from "react"
import { AppLogo } from "./AppLogo"
import { useWelcomeData } from "@/hooks/useWelcomeData"
import { useAuth } from "@/context/AuthContext"
import { useAllMatches } from "@/hooks/useAllMatches"
import { useTournaments } from "@/hooks/useTournaments"
import { usePlayerProfile } from "@/hooks/usePlayerProfile"
import Link from "next/link"
import { Button } from "./ui/button"
import { Users, Trophy, Sparkles, ChevronRight, Swords, CalendarDays, Target } from "lucide-react"

const WelcomeContextual = () => {
   const { player } = useAuth()
   const { allMatches } = useAllMatches()
   const { tournaments } = useTournaments()
   const { rank } = usePlayerProfile(player?.ci || "")
   const [mounted, setMounted] = useState(false)

   useEffect(() => {
      setMounted(true)
   }, [])

   // Define the contextual state
   let state: "upcoming_match" | "tournaments_open" | "rank_push" | "guest" = "guest"
   let specificData: any = null

   if (!mounted || !player) {
      state = "guest"
   } else {
      // 1. Is there an upcoming match?
      const pendingMatches = allMatches.filter(m => 
          (m.player1Ci === player.ci || m.player2Ci === player.ci) && 
          (m.status === "Pendiente" || m.status === "Propuesto")
      ).sort((a,b) => new Date(a.matchDatetime).getTime() - new Date(b.matchDatetime).getTime())

      if (pendingMatches.length > 0) {
         state = "upcoming_match"
         specificData = pendingMatches[0]
      } else {
         // 2. Are there open tournaments?
         const openTournaments = tournaments.filter(t => t.status === "Próximo")
         if (openTournaments.length > 0) {
            state = "tournaments_open"
            specificData = openTournaments[0]
         } else {
            // 3. Fallback: Rank Push
            state = "rank_push"
         }
      }
   }

   // Content generator based on state
   const renderContextualCard = () => {
      switch(state) {
         case "upcoming_match":
            const isP1 = specificData.player1Ci === player?.ci
            const opponentName = isP1 ? specificData.player2Name : specificData.player1Name
            return (
               <div className="relative overflow-hidden bg-gradient-to-r from-orange-900/40 via-red-900/40 to-slate-900/40 border border-orange-500/30 rounded-2xl p-6 md:p-8 backdrop-blur-md shadow-2xl">
                  <div className="absolute top-0 right-0 -mr-8 -mt-8 text-orange-500/10">
                    <Swords className="w-40 h-40" />
                  </div>
                  <div className="relative z-10 flex flex-col items-center text-center">
                    <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
                      ¡Prepárate, {player?.first_name}!
                    </h3>
                    <p className="text-slate-300 mb-6 max-w-md">
                      Tu próximo partido es contra <strong className="text-orange-400">{opponentName}</strong> en el torneo {specificData.tournamentName}. El inicio está cerca.
                    </p>
                    <Button asChild className="font-bold bg-orange-600 hover:bg-orange-500 text-white shadow-lg shadow-orange-900/40">
                       <Link href={`/tournaments/detail?id=${specificData.tournamentId}`}>
                          Ver Detalles <ChevronRight className="w-5 h-5 ml-1" />
                       </Link>
                    </Button>
                  </div>
               </div>
            )

         case "tournaments_open":
            return (
               <div className="relative overflow-hidden bg-gradient-to-r from-green-900/40 via-emerald-900/40 to-slate-900/40 border border-emerald-500/30 rounded-2xl p-6 md:p-8 backdrop-blur-md shadow-2xl">
                  <div className="absolute top-0 right-0 -mr-8 -mt-8 text-emerald-500/10">
                    <CalendarDays className="w-40 h-40" />
                  </div>
                  <div className="relative z-10 flex flex-col items-center text-center">
                    <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
                    Inscripciones Abiertas
                    </h3>
                    <p className="text-slate-300 mb-6 max-w-md">
                      El torneo <strong className="text-emerald-400">{specificData.name}</strong> está recibiendo jugadores. ¿Te anotas a la competencia?
                    </p>
                    <Button asChild className="font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/40">
                       <Link href={`/tournaments/detail?id=${specificData.tournament_id}`}>
                          Inscribirme Ahora <ChevronRight className="w-5 h-5 ml-1" />
                       </Link>
                    </Button>
                  </div>
               </div>
            )
         
         case "rank_push":
            return (
               <div className="relative overflow-hidden bg-gradient-to-r from-yellow-900/40 via-amber-900/40 to-slate-900/40 border border-yellow-500/30 rounded-2xl p-6 md:p-8 backdrop-blur-md shadow-2xl">
                  <div className="absolute top-0 right-0 -mr-8 -mt-8 text-yellow-500/10">
                    <Target className="w-40 h-40" />
                  </div>
                  <div className="relative z-10 flex flex-col items-center text-center">
                    <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
                      Apunta a la cima, {player?.first_name}
                    </h3>
                    <p className="text-slate-300 mb-6 max-w-md">
                      Estás en la posición <strong className="text-yellow-400">#{rank || '-'}</strong>. ¡Juega partidos oficiales, mejora tu juego y sube en la clasificación!
                    </p>
                    <Button asChild className="font-bold bg-yellow-600 hover:bg-yellow-500 text-white shadow-lg shadow-yellow-900/40">
                       <Link href="/matches">
                          Buscar Rival <ChevronRight className="w-5 h-5 ml-1" />
                       </Link>
                    </Button>
                  </div>
               </div>
            )

         case "guest":
         default:
            return (
               <div className="relative overflow-hidden bg-gradient-to-r from-purple-900/40 via-indigo-900/40 to-slate-900/40 border border-purple-500/30 rounded-2xl p-8 backdrop-blur-md shadow-2xl">
                 <div className="absolute top-0 right-0 -mr-8 -mt-8 text-purple-500/10">
                    <Sparkles className="w-40 h-40" />
                 </div>
                 
                  <div className="relative z-10 flex flex-col items-center text-center">
                   <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
                     ¡Nuevo inicio de semestre!
                   </h3>
                   <p className="text-slate-300 mb-8 max-w-md">
                     Renueva tus datos para participar en la nueva temporada o regístrate si eres nuevo en el club.
                   </p>
                   <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full sm:w-auto">
                     <Button
                       asChild
                       className="w-full sm:w-auto text-[17px] py-6 px-8 font-bold shadow-lg shadow-purple-900/40 transition-all duration-300 hover:shadow-purple-700/50 hover:-translate-y-0.5 group"
                       size="lg"
                       variant="outstanding"
                     >
                       <Link href="/player-registration">
                         ¡Únete Ahora!
                         <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                       </Link>
                     </Button>
                      <Button
                       asChild
                       className="w-full sm:w-auto text-[17px] py-6 px-8 font-bold border-slate-600 text-slate-200 hover:bg-white/5 hover:text-white transition-all duration-300 hover:-translate-y-0.5 group"
                       size="lg"
                       variant="outline"
                     >
                       <Link href="/renew-data">
                         Renovar Datos
                       </Link>
                     </Button>
                   </div>
                 </div>
               </div>
            )
      }
   }

   return (
      <div className="w-full max-w-2xl px-4 z-10 animate-slide-in-from-bottom" style={{ animationDelay: '0.4s', animationFillMode: 'both' }}>
         {renderContextualCard()}
      </div>
   )
}

const Welcome: React.FC = () => {
  const { playerCount, activeTournamentsCount, loading, error } = useWelcomeData()

  return (
    <div className="relative text-center flex flex-col items-center space-y-12 py-10">
      {/* Background decorations */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-[400px] bg-purple-600/20 blur-[100px] rounded-full pointer-events-none -z-10 animate-pulse" style={{ animationDuration: '4s' }} />
      <div className="absolute top-0 right-10 w-64 h-64 bg-blue-500/10 blur-[80px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-10 w-64 h-64 bg-pink-500/10 blur-[80px] rounded-full pointer-events-none -z-10" />

      <div className="animate-fade-in-up flex flex-col items-center space-y-6 z-10">
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
          <div className="relative">
            <AppLogo />
          </div>
        </div>

        <div className="space-y-4 max-w-2xl px-4">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-100 to-slate-300">
            Liga de Ping Pong
          </h1>
          <p className="text-slate-400 text-lg md:text-xl font-medium max-w-xl mx-auto leading-relaxed">
            Compite, mejora y domina en los torneos oficiales del club de Tenis de Mesa del IUJO.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:gap-6 w-full max-w-lg px-4 z-10 animate-fade-in" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
        <div className="group bg-[#2A2A3E]/30 backdrop-blur-md p-6 rounded-2xl border border-slate-700/50 hover:border-purple-500/50 transition-all duration-300 hover:shadow-[0_0_30px_-5px_rgba(168,85,247,0.3)] hover:-translate-y-1 flex flex-col items-center justify-center">
          <div className="bg-purple-500/10 p-3 rounded-full mb-3 group-hover:scale-110 transition-transform duration-300">
            <Users className="w-6 h-6 text-purple-400" />
          </div>
          <p className="text-slate-400 font-medium mb-1">Jugadores</p>
          {loading ? (
             <div className="h-10 w-16 bg-slate-700/50 rounded animate-pulse my-1"></div>
          ) : (
            <p className="text-4xl font-bold text-white tracking-tight">{playerCount}</p>
          )}
        </div>
        <div className="group bg-[#2A2A3E]/30 backdrop-blur-md p-6 rounded-2xl border border-slate-700/50 hover:border-blue-500/50 transition-all duration-300 hover:shadow-[0_0_30px_-5px_rgba(59,130,246,0.3)] hover:-translate-y-1 flex flex-col items-center justify-center">
          <div className="bg-blue-500/10 p-3 rounded-full mb-3 group-hover:scale-110 transition-transform duration-300">
             <Trophy className="w-6 h-6 text-blue-400" />
          </div>
          <p className="text-slate-400 font-medium mb-1">Torneos Activos</p>
          {loading ? (
             <div className="h-10 w-16 bg-slate-700/50 rounded animate-pulse my-1"></div>
          ) : (
            <p className="text-4xl font-bold text-white tracking-tight">{activeTournamentsCount - 2}</p>
          )}
        </div>
      </div>

      {error && <p className="text-red-400 text-sm bg-red-900/20 px-4 py-2 rounded-lg border border-red-500/20 backdrop-blur-sm">{error.message || "Error al cargar los datos."}</p>}
      
      <WelcomeContextual />
    </div>
  )
}

export default Welcome
