import type React from "react"
import { ArrowRightIcon } from "./icons"

const tournamentsData: any[] = [
  {
    tournament_id: 3,
    name: "Liga 2-2025 | Avanzado (Play-In)",
    tournament_type: "Individual",
    participants: 0,
    status: "En Curso",
    stage: "Fase de Puntos",
    progress: 0,
  },
  {
    tournament_id: 4,
    name: "Liga 2-2025 | Intermedio (Play-In)",
    tournament_type: "Individual",
    participants: 0,
    status: "En Curso",
    stage: "Fase de Puntos",
    progress: 0,
  },
  {
    tournament_id: 5,
    name: "Liga 2-2025 | Principiante (Play-In)",
    tournament_type: "Individual",
    participants: 0,
    status: "En Curso",
    stage: "Fase de Puntos",
    progress: 0,
  },
  {
    tournament_id: 6,
    name: "Liga 2-2025 | Sin experiencia (Play-In)",
    tournament_type: "Individual",
    participants: 0,
    status: "En Curso",
    stage: "Fase de Puntos",
    progress: 0,
  },
]

const TournamentCard: React.FC<{ tournament: any }> = ({ tournament }) => {
  return (
    <div className="bg-[#2A2A3E] p-5 rounded-2xl border border-slate-700/50 space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-bold text-white">{tournament.name}</h3>
          <p className="text-sm text-slate-400">
            {tournament.tournament_type} • {tournament.participants}{" "}
            {tournament.tournament_type === "Individual" ? "participantes" : "equipos"}
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
          {(tournament.players || [])
            .slice(0, 3)
            .map((p: { id: React.Key | null | undefined; avatar: any; name: string | undefined }) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={p.id}
                src={p.avatar || "/placeholder.svg"}
                alt={p.name}
                className="w-8 h-8 rounded-full border-2 border-[#2A2A3E]"
              />
            ))}
          {(tournament.players?.length || 0) > 3 && (
            <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-xs font-bold border-2 border-[#2A2A3E]">
              +{(tournament.players?.length || 0) - 3 + (tournament.tournament_type === "Dobles" ? 1 : 0)}
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
      </div>
      <div className="space-y-4">
        {tournamentsData.map((t) => (
          <TournamentCard key={t.tournament_id} tournament={t} />
        ))}
      </div>
    </section>
  )
}

export default InProgressTournaments
