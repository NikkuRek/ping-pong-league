import type React from "react"
import type { Match, Player } from "@/types"

const p1: Player = {
  id: 3,
  name: "Carlos Mendoza",
  avatar: "https://picsum.photos/seed/player3/48/48",
  rating: 2320,
  major: "Ing. Software - 6to",
}
const p2: Player = {
  id: 2,
  name: "Ana García",
  avatar: "https://picsum.photos/seed/player2/48/48",
  rating: 2380,
  major: "Ing. Industrial - 4to",
}
const p3: Player = {
  id: 6,
  name: "Luis Rodriguez",
  avatar: "https://picsum.photos/seed/player6/48/48",
  rating: 2200,
  major: "Ing. Sistemas - 8vo",
}
const p4: Player = {
  id: 7,
  name: "María López",
  avatar: "https://picsum.photos/seed/player7/48/48",
  rating: 2230,
  major: "Ing. Civil - 5to",
}

const matchesData: Match[] = [
  {
    id: 1,
    player1: p1,
    player2: p2,
    score1: 3,
    score2: 1,
    tournamentName: "Copa Primavera 2024",
    timeAgo: "Hace 2 horas",
    sets: [
      { p1: 11, p2: 8 },
      { p1: 11, p2: 6 },
      { p1: 9, p2: 11 },
      { p1: 11, p2: 7 },
    ],
  },
  {
    id: 2,
    player1: p3,
    player2: p4,
    score1: 1,
    score2: 3,
    tournamentName: "Torneo Dobles Mixto",
    timeAgo: "Hace 4 horas",
    sets: [
      { p1: 8, p2: 11 },
      { p1: 11, p2: 9 },
      { p1: 7, p2: 11 },
      { p1: 9, p2: 11 },
    ],
  },
]

const MatchCard: React.FC<{ match: Match }> = ({ match }) => {
  return (
    <div className="bg-[#2A2A3E] p-4 rounded-2xl border border-slate-700/50 space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3 text-left">
          <img
            src={match.player1.avatar || "/placeholder.svg"}
            alt={match.player1.name}
            className="w-12 h-12 rounded-full"
          />
          <div>
            <p className="font-bold text-white">{match.player1.name}</p>
            <p className="text-xs text-slate-400">{match.player1.major}</p>
          </div>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold">
            <span className={match.score1 > match.score2 ? "text-white" : "text-slate-400"}>{match.score1}</span>
            <span className="text-slate-500 mx-2">VS</span>
            <span className={match.score2 > match.score1 ? "text-white" : "text-slate-400"}>{match.score2}</span>
          </p>
        </div>
        <div className="flex items-center gap-3 text-right">
          <div>
            <p className="font-bold text-white">{match.player2.name}</p>
            <p className="text-xs text-slate-400">{match.player2.major}</p>
          </div>
          <img
            src={match.player2.avatar || "/placeholder.svg"}
            alt={match.player2.name}
            className="w-12 h-12 rounded-full"
          />
        </div>
      </div>
      <div className="text-center">
        <p className="text-sm text-slate-400">{match.tournamentName}</p>
        <p className="text-xs text-slate-500">{match.timeAgo}</p>
      </div>
      <div className="flex justify-center gap-2">
        {match.sets.map((set, index) => (
          <div
            key={index}
            className={`px-3 py-1 rounded text-sm font-semibold ${set.p1 > set.p2 ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}
          >
            {set.p1 > set.p2 ? `${set.p1}-${set.p2}` : `${set.p2}-${set.p1}`}
          </div>
        ))}
      </div>
    </div>
  )
}

const RecentMatches: React.FC = () => {
  return (
    <section>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-white">Partidos Recientes</h2>
        <a href="#" className="text-sm text-blue-400 font-semibold hover:text-blue-300">
          Ver Historial
        </a>
      </div>
      <div className="space-y-4">
        {matchesData.map((m) => (
          <MatchCard key={m.id} match={m} />
        ))}
      </div>
    </section>
  )
}

export default RecentMatches
