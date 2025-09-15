import type React from "react"
import { SearchIcon } from "./icons"

const AppLogo: React.FC<{ size?: string }> = ({ size = "w-24 h-24" }) => (
  <div
    className={`flex-shrink-0 ${size} bg-gradient-to-br from-purple-500 to-indigo-600 rounded-3xl flex items-center justify-center shadow-lg shadow-purple-500/20`}
  >
    <div className="w-1/2 h-1/2 bg-white/90 rounded-full flex items-center justify-center">
      <div className="w-1/3 h-1/3 bg-purple-500 rounded-md transform rotate-45"></div>
    </div>
  </div>
)

const Welcome: React.FC = () => {
  return (
    <div className="text-center flex flex-col items-center space-y-8">
      <AppLogo />
      <div className="space-y-2">
        <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">Bienvenido a TorneoTT</h1>
        <p className="text-slate-400 text-lg">Sistema de gestión de torneos de tenis de mesa</p>
      </div>
      <div className="grid grid-cols-2 gap-4 w-full max-w-md">
        <div className="bg-[#2A2A3E] p-4 rounded-xl text-center border border-slate-700">
          <p className="text-3xl font-bold text-blue-400">12</p>
          <p className="text-slate-400">Torneos Activos</p>
        </div>
        <div className="bg-[#2A2A3E] p-4 rounded-xl text-center border border-slate-700">
          <p className="text-3xl font-bold text-blue-400">248</p>
          <p className="text-slate-400">Jugadores</p>
        </div>
      </div>
      <div className="flex gap-4 w-full max-w-md">
        <button className="flex-1 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:scale-105 transition-transform">
          + Nuevo Torneo
        </button>
        <button className="flex-1 bg-[#2A2A3E] border border-slate-700 text-slate-300 font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2 hover:bg-slate-700 transition-colors">
          <SearchIcon className="w-5 h-5" />
          Buscar
        </button>
      </div>
    </div>
  )
}

export default Welcome
