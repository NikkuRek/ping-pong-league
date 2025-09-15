import type React from "react"
import type { UpcomingTournament } from "@/types"
import { ClockIcon, UsersIcon } from "./icons"

const upcomingData: UpcomingTournament[] = [
  {
    id: 1,
    name: "Torneo Intercareeras",
    date: "15 Mar 2024",
    day: "15",
    month: "MAR",
    type: "Individual",
    details: "Inscripciones abiertas",
    slots: 64,
    registered: 32,
    time: "9:00 AM",
  },
  {
    id: 2,
    name: "Copa Veteranos",
    date: "22 Mar 2024",
    day: "22",
    month: "MAR",
    type: "Individual",
    details: "+25 años",
    slots: 32,
    registered: 18,
    time: "2:00 PM",
  },
]

const UpcomingTournamentCard: React.FC<{ tournament: UpcomingTournament; isPrimary: boolean }> = ({
  tournament,
  isPrimary,
}) => {
  const progress = (tournament.registered / tournament.slots) * 100

  return (
    <div className="bg-[#2A2A3E] p-4 rounded-2xl border border-slate-700/50 space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-purple-500/20 text-purple-400">
              Próximo
            </span>
            <span className="text-xs text-slate-400">{tournament.date}</span>
          </div>
          <h3 className="text-lg font-bold text-white">{tournament.name}</h3>
          <p className="text-sm text-slate-400">
            {tournament.type} • {tournament.details}
          </p>
        </div>
        <div className="text-center flex-shrink-0 bg-slate-800/50 rounded-lg p-2">
          <p className="text-2xl font-bold text-white">{tournament.day}</p>
          <p className="text-xs text-slate-400">{tournament.month}</p>
        </div>
      </div>

      <div className="flex justify-between text-sm text-slate-400">
        <div className="flex items-center gap-1.5">
          <UsersIcon className="w-4 h-4" /> {tournament.slots} lugares
        </div>
        <div className="flex items-center gap-1.5">
          <ClockIcon className="w-4 h-4" /> {tournament.time}
        </div>
      </div>

      <div>
        <div className="w-full bg-slate-700 rounded-full h-2 mb-1">
          <div
            className="bg-gradient-to-r from-purple-600 to-pink-500 h-2 rounded-full"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <p className="text-xs text-slate-400">
          {tournament.registered} / {tournament.slots} inscritos
        </p>
      </div>

      <button
        className={`w-full font-semibold py-2.5 rounded-lg transition-all ${isPrimary ? "bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-lg hover:scale-105" : "bg-slate-700/50 text-slate-300 hover:bg-slate-700"}`}
      >
        Inscribirse
      </button>
    </div>
  )
}

const UpcomingTournaments: React.FC = () => {
  return (
    <section>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-white">Próximos Torneos</h2>
        <a href="#" className="text-sm text-blue-400 font-semibold hover:text-blue-300">
          Calendario
        </a>
      </div>
      <div className="space-y-4">
        {upcomingData.map((t, index) => (
          <UpcomingTournamentCard key={t.id} tournament={t} isPrimary={index === 0} />
        ))}
      </div>
    </section>
  )
}

export default UpcomingTournaments
