"use client"
import type React from "react"
import { AppLogo } from "./AppLogo";
// import { useWelcomeData } from "@/hooks/useWelcomeData";

const Welcome: React.FC = () => {
  // const { playerCount, activeTournamentsCount, loading, error } = useWelcomeData();

  return (
    <div className="text-center flex flex-col items-center space-y-8">
      <AppLogo />
      <div className="space-y-2">
        <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">Bienvenido a la Liga de Ping Pong (LPP)</h1>
        <p className="text-slate-400 text-lg">Sistema de gestión de torneos de tenis de mesa</p>
      </div>
      <div className="grid grid-cols-2 gap-4 w-full max-w-md">
        <div className="bg-[#2A2A3E] p-4 rounded-xl text-center border border-slate-700">
          {/* {loading ? <p className="text-3xl font-bold text-blue-400">...</p> : <p className="text-3xl font-bold text-blue-400">{playerCount}</p>} */}
          <p className="text-slate-400">Jugadores</p>
          <p className="text-3xl font-bold text-blue-400">48</p>
        </div>
        <div className="bg-[#2A2A3E] p-4 rounded-xl text-center border border-slate-700">
          {/* {loading ? <p className="text-3xl font-bold text-blue-400">...</p> : <p className="text-3xl font-bold text-blue-400">{activeTournamentsCount}</p>} */}
          <p className="text-slate-400">Torneos Activos</p>
          <p className="text-3xl font-bold text-blue-400">1</p>
        </div>
      </div>
      {/* {error && <p className="text-red-500">Error al cargar los datos.</p>} */}
    </div>
  )
}

export default Welcome
