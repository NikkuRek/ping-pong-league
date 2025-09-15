import type React from "react"
import type { Player } from "@/types"

const rankingData: Player[] = [
  {
    id: 1,
    rank: 1,
    name: "Diego Morales",
    avatar: "https://picsum.photos/seed/player1/40/40",
    rating: 2450,
    major: "Ing. Software",
    weeklyChange: 45,
  },
  {
    id: 2,
    rank: 2,
    name: "Ana García",
    avatar: "https://picsum.photos/seed/player2/40/40",
    rating: 2380,
    major: "Ing. Industrial",
    weeklyChange: 28,
  },
  {
    id: 3,
    rank: 3,
    name: "Carlos Mendoza",
    avatar: "https://picsum.photos/seed/player3/40/40",
    rating: 2320,
    major: "Ing. Software",
    weeklyChange: -12,
  },
  {
    id: 4,
    rank: 4,
    name: "Roberto Silva",
    avatar: "https://picsum.photos/seed/player4/40/40",
    rating: 2290,
    major: "Ing. Civil",
    weeklyChange: 18,
  },
  {
    id: 5,
    rank: 5,
    name: "Patricia Ruiz",
    avatar: "https://picsum.photos/seed/player5/40/40",
    rating: 2250,
    major: "Ing. Química",
    weeklyChange: 35,
  },
]

const rankColors: { [key: number]: string } = {
  1: "bg-purple-600",
  2: "bg-indigo-600",
  3: "bg-orange-500",
}

const PlayerRankItem: React.FC<{ player: Player }> = ({ player }) => {
  const weeklyChangePositive = player.weeklyChange && player.weeklyChange >= 0

  return (
    <div className="flex items-center bg-[#2A2A3E] p-3 rounded-lg border border-slate-700/50">
      <div className="flex items-center gap-4 flex-1">
        <span
          className={`w-8 h-8 flex items-center justify-center font-bold text-white rounded-full ${rankColors[player.rank || 0] || "bg-slate-600"}`}
        >
          {player.rank}
        </span>
        <img src={player.avatar || "/placeholder.svg"} alt={player.name} className="w-10 h-10 rounded-full" />
        <div>
          <p className="font-semibold text-white">{player.name}</p>
          <p className="text-xs text-slate-400">
            {player.major} • {player.rating} Aura
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className={`font-bold ${weeklyChangePositive ? "text-green-400" : "text-red-400"}`}>
          {weeklyChangePositive ? "+" : ""}
          {player.weeklyChange}
        </p>
        <p className="text-xs text-slate-500">Esta semana</p>
      </div>
    </div>
  )
}

const PlayerRanking: React.FC = () => {
  return (
    <section>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-white">Ranking de Jugadores</h2>
        <a href="#" className="text-sm text-blue-400 font-semibold hover:text-blue-300">
          Ver Completo
        </a>
      </div>
      <div className="space-y-3">
        {rankingData.map((p) => (
          <PlayerRankItem key={p.id} player={p} />
        ))}
      </div>
    </section>
  )
}

export default PlayerRanking
