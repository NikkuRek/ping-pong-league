import type React from "react"
import type { Tournament } from "@/types"
import { ArrowRightIcon } from "./icons"

const tournamentsData: Tournament[] = [
  {
    id: 1,
    name: "Copa Primavera 2024",
    type: "Individual",
    participants: 32,
    status: "En Curso",
    stage: "Semifinales",
    progress: 85,
    players: [
      {
        id: "V28123456",
        name: "Diego M.",
        avatar: "https://picsum.photos/seed/player1/40/40",
        rating: 2450,
        major: "Ing. Software",
      },
      {
        id: "V27890123",
        name: "Ana G.",
        avatar: "https://picsum.photos/seed/player2/40/40",
        rating: 2380,
        major: "Ing. Industrial",
      },
      {
        id: "V28456123",
        name: "Carlos M.",
        avatar: "https://picsum.photos/seed/player3/40/40",
        rating: 2320,
        major: "Ing. Software",
      },
    ],
  },
  {
    id: 2,
    name: "Torneo Dobles Mixto",
    type: "Dobles",
    participants: 16,
    status: "Cuartos",
    stage: "8 equipos restantes",
    progress: 62,
    players: [
      {
        id: "V29876543",
        name: "Roberto S.",
        avatar: "https://picsum.photos/seed/player4/40/40",
        rating: 2290,
        major: "Ing. Civil",
      },
      {
        id: "V24321987",
        name: "Patricia R.",
        avatar: "https://picsum.photos/seed/player5/40/40",
        rating: 2250,
        major: "Ing. Química",
      },
      {
        id: "V26123789",
        name: "Luis R.",
        avatar: "https://picsum.photos/seed/player6/40/40",
        rating: 2200,
        major: "Ing. Sistemas",
      },
    ],
  },
]

const TournamentCard: React.FC<{ tournament: Tournament }> = ({ tournament }) => {
  return (
    <div className="bg-[#2A2A3E] p-5 rounded-2xl border border-slate-700/50 space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-bold text-white">{tournament.name}</h3>
          <p className="text-sm text-slate-400">
            {tournament.type} • {tournament.participants}{" "}
            {tournament.type === "Individual" ? "participantes" : "equipos"}
          </p>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-blue-400">{tournament.progress}%</p>
          <p className="text-sm text-slate-400">Completado</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span
          className={`px-3 py-1 text-xs font-semibold rounded-full ${tournament.status === "En Curso" ? "bg-green-500/20 text-green-400" : "bg-blue-500/20 text-blue-400"}`}
        >
          {tournament.status}
        </span>
        <span className="text-sm text-slate-400">{tournament.stage}</span>
      </div>

      <div className="w-full bg-slate-700 rounded-full h-2">
        <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${tournament.progress}%` }}></div>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex -space-x-3">
          {tournament.players.slice(0, 3).map((p) => (
            <img
              key={p.id}
              src={p.avatar || "/placeholder.svg"}
              alt={p.name}
              className="w-8 h-8 rounded-full border-2 border-[#2A2A3E]"
            />
          ))}
          {tournament.players.length > 3 && (
            <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-xs font-bold border-2 border-[#2A2A3E]">
              +{tournament.players.length - 3 + (tournament.type === "Dobles" ? 1 : 0)}
            </div>
          )}
        </div>
        <a href="#" className="flex items-center gap-2 text-sm text-blue-400 font-semibold hover:text-blue-300">
          Ver Detalles <ArrowRightIcon />
        </a>
      </div>
    </div>
  )
}

const InProgressTournaments: React.FC = () => {
  return (
    <section>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-white">Torneos en Curso</h2>
        <a href="#" className="text-sm text-blue-400 font-semibold hover:text-blue-300">
          Ver Todos
        </a>
      </div>
      <div className="space-y-4">
        {tournamentsData.map((t) => (
          <TournamentCard key={t.id} tournament={t} />
        ))}
      </div>
    </section>
  )
}

export default InProgressTournaments
