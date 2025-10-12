import type React from "react"
import { TrophyIcon, PodiumIcon } from "./icons"

const MyProfile: React.FC = () => {
  const user = {
    name: "Diego Morales",
    avatar: "https://picsum.photos/seed/player1/96/96",
    major: "Informática",
    semester: "6to Semestre",
    aura: 1600,
    wins: 24,
    losses: 8,
    tournamentsWon: 0,
    podiums: 0,
    rank: 3,
    days: [1, 2, 3, 5],
  }

  return (
    <section>
      {/* <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-white">Mi Perfil</h2>
        <a href="#" className="text-sm text-purple-400 font-semibold hover:text-purple-300">
          Editar
        </a>
      </div> */}
      <div className="bg-[#2A2A3E] p-5 rounded-2xl border border-slate-700/50 space-y-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img src={user.avatar || "/placeholder.svg"} alt={user.name} className="w-20 h-20 rounded-full" />
            <span className="absolute bottom-0 right-0 w-8 h-8 flex items-center justify-center font-bold text-white rounded-full bg-purple-600 border-2 border-[#2A2A3E]">
              #{user.rank}
            </span>
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">{user.name}</h3>
            <p className="text-sm text-slate-400">
              {user.major} • {user.semester}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-3 text-center divide-x divide-slate-700">
          <div>
            <p className="text-2xl font-bold text-purple-500">{user.aura}</p>
            <p className="text-xs text-slate-400">Aura</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-400">{user.wins}</p>
            <p className="text-xs text-slate-400">Victorias</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-red-400">{user.losses}</p>
            <p className="text-xs text-slate-400">Derrotas</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-800/50 p-3 rounded-lg flex items-center gap-3">
            <TrophyIcon className="w-8 h-8 text-yellow-400" />
            <div>
              <p className="font-bold text-white">{user.tournamentsWon}</p>
              <p className="text-xs text-slate-400">Torneos Ganados</p>
            </div>
          </div>
          <div className="bg-slate-800/50 p-3 rounded-lg flex items-center gap-3">
            <PodiumIcon className="w-8 h-8 text-yellow-400" />
            <div>
              <p className="font-bold text-white">{user.podiums}</p>
              <p className="text-xs text-slate-400">Podios</p>
            </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-2">Días disponibles</h4>
            <div className="flex justify-center space-x-4">
            {[
              { id: 1, name: "Lun" },
              { id: 2, name: "Mar" },
              { id: 3, name: "Mié" },
              { id: 4, name: "Jue" },
              { id: 5, name: "Vie" },
            ].map((d) => {
              const available = user.days.includes(d.id)
              return (
              <span
                key={d.id}
                className={
                "px-4 py-1 rounded-full text-xs font-medium " +
                (available
                  ? "bg-green-500 text-white"
                  : "border-b-gray-400 border-2 text-slate-400")
                }
              >
                {d.name}
              </span>
              )
            })}
            </div>
          </div>

          </div>
        </section>
        )
      }

      export default MyProfile
