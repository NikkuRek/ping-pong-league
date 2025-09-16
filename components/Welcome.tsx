import type React from "react"
import { AppLogo } from "./AppLogo";

const Welcome: React.FC = () => {
  return (
    <div className="text-center flex flex-col items-center space-y-8">
      <AppLogo />
      <div className="space-y-2">
        <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">Bienvenido a la Liga de Ping Pong (LPP)</h1>
        <p className="text-slate-400 text-lg">Sistema de gestión de torneos de tenis de mesa</p>
      </div>
      <div className="grid grid-cols-2 gap-4 w-full max-w-md">
        <div className="bg-[#2A2A3E] p-4 rounded-xl text-center border border-slate-700">
          <p className="text-3xl font-bold text-blue-400">80</p>
          <p className="text-slate-400">Jugadores</p>
        </div>
        <div className="bg-[#2A2A3E] p-4 rounded-xl text-center border border-slate-700">
          <p className="text-3xl font-bold text-blue-400">2</p>
          <p className="text-slate-400">Torneos Activos</p>
        </div>
      </div>
    </div>
  )
}

export default Welcome
